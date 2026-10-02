import fs from 'fs';
import path from 'path';
import type { Core } from '@strapi/strapi';

// Acciones de solo lectura que el rol Public puede usar en la API REST.
// Los permisos se guardan en la base de datos y no viajan por Git, por eso
// se crean al arrancar: así cada instalación del grupo los tiene sin
// configurarlos a mano en el panel.
const PERMISOS_PUBLICOS = ['categoria', 'zona', 'incidente', 'reporte'].flatMap((nombre) => [
  `api::${nombre}.${nombre}.find`,
  `api::${nombre}.${nombre}.findOne`,
]);

// El panel solo deja entrar a administradores: para saber el rol del usuario
// que inicia sesión, el frontend consulta /api/users/me?populate=role con su
// token. Sin permiso de lectura sobre roles, Strapi quita el rol de la respuesta.
// logout permite cerrar la sesión en Strapi y no solo borrar las cookies.
// find y update son para la página de usuarios del panel (listar, renombrar
// y desactivar); el frontend solo envía el nombre y el estado.
// Con token, Strapi aplica los permisos del rol y no los de Public: para
// contar los reportes de cada usuario el administrador necesita leer reportes.
const PERMISOS_ADMINISTRADOR = [
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.role.find',
  'plugin::users-permissions.auth.logout',
  'plugin::users-permissions.user.find',
  'plugin::users-permissions.user.update',
  'api::reporte.reporte.find',
  // Cambiar el estado de un incidente desde el listado o la ficha
  'api::incidente.incidente.update',
];

/**
 * Asigna al rol las acciones que todavía no tiene. Si el rol no existe
 * (por ejemplo, Administrador en una base sin seed) no hace nada.
 */
async function asignarPermisos(strapi: Core.Strapi, tipoRol: string, acciones: string[]) {
  const rol = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: tipoRol } });

  if (!rol) return;

  const existentes = await strapi.db
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: rol.id, action: { $in: acciones } } });
  const yaAsignados = new Set(existentes.map((permiso) => permiso.action));

  for (const action of acciones.filter((a) => !yaAsignados.has(a))) {
    await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: rol.id } });
  }
}

type RolSeed = { type: string; name: string; description: string };
type UsuarioSeed = { username: string; email: string; rol: string; bloqueado?: boolean };
type SeedUsuarios = { roles: RolSeed[]; password: string; usuarios: UsuarioSeed[] };

type ReporteSeed = { autor: string; descripcion: string; fecha: string };
type IncidenteSeed = {
  titulo: string;
  descripcion: string;
  direccion: string;
  estado: 'abierto' | 'en_curso' | 'cerrado';
  fechaApertura: string;
  fechaCierre: string | null;
  categoria: string;
  zona: string;
  reportes: ReporteSeed[];
};
type SeedIncidentes = {
  categorias: { nombre: string; descripcion: string }[];
  zonas: { nombre: string }[];
  incidentes: IncidenteSeed[];
};

function leerSeed<T>(strapi: Core.Strapi, archivo: string): T {
  const ruta = path.join(strapi.dirs.app.root, 'database', 'seed', archivo);
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

// "Árbol caído" -> "arbol-caido"
const slugify = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Carga los roles y usuarios de prueba de database/seed/usuarios.json.
 * Es idempotente: solo crea lo que todavía no existe, así que se puede
 * correr en cada arranque sin duplicar datos.
 */
async function seedUsuarios(strapi: Core.Strapi) {
  const seed = leerSeed<SeedUsuarios>(strapi, 'usuarios.json');

  const roleQuery = strapi.db.query('plugin::users-permissions.role');
  const rolesPorType: Record<string, number> = {};

  for (const rol of seed.roles) {
    const existente = await roleQuery.findOne({ where: { type: rol.type } });
    rolesPorType[rol.type] = existente ? existente.id : (await roleQuery.create({ data: rol })).id;
  }

  const userQuery = strapi.db.query('plugin::users-permissions.user');
  const userService = strapi.plugin('users-permissions').service('user');
  let creados = 0;

  for (const usuario of seed.usuarios) {
    if (await userQuery.findOne({ where: { email: usuario.email } })) continue;

    // add() usa el Document Service, que hashea la contraseña
    await userService.add({
      username: usuario.username,
      email: usuario.email,
      password: seed.password,
      provider: 'local',
      confirmed: true,
      blocked: usuario.bloqueado ?? false,
      role: rolesPorType[usuario.rol],
    });
    creados++;
  }

  if (creados > 0) strapi.log.info(`[seed] ${creados} usuarios de prueba creados`);
}

/**
 * Carga categorías, zonas, incidentes y sus reportes de database/seed/incidentes.json.
 * Categorías y zonas se crean si faltan; incidentes y reportes solo se cargan
 * cuando no hay ningún incidente, para no duplicarlos en cada arranque.
 * Necesita que los usuarios ya existan, porque cada reporte tiene un autor.
 */
async function seedIncidentes(strapi: Core.Strapi) {
  const seed = leerSeed<SeedIncidentes>(strapi, 'incidentes.json');

  const categorias: Record<string, string> = {};
  for (const { nombre, descripcion } of seed.categorias) {
    const existente = await strapi.documents('api::categoria.categoria').findFirst({ filters: { nombre } });
    categorias[nombre] = (
      existente ??
      (await strapi.documents('api::categoria.categoria').create({
        data: { nombre, slug: slugify(nombre), descripcion },
      }))
    ).documentId;
  }

  const zonas: Record<string, string> = {};
  for (const { nombre } of seed.zonas) {
    const existente = await strapi.documents('api::zona.zona').findFirst({ filters: { nombre } });
    zonas[nombre] = (
      existente ?? (await strapi.documents('api::zona.zona').create({ data: { nombre, slug: slugify(nombre) } }))
    ).documentId;
  }

  if ((await strapi.documents('api::incidente.incidente').count({})) > 0) return;

  const usuarios = await strapi.db.query('plugin::users-permissions.user').findMany({ select: ['username', 'documentId'] });
  const autores: Record<string, string> = Object.fromEntries(usuarios.map((u) => [u.username, u.documentId]));

  let reportes = 0;
  for (const { reportes: reportesSeed, categoria, zona, fechaCierre, ...incidente } of seed.incidentes) {
    const creado = await strapi.documents('api::incidente.incidente').create({
      data: {
        ...incidente,
        ...(fechaCierre && { fechaCierre }),
        categoria: categorias[categoria],
        zona: zonas[zona],
      },
    });

    for (const { autor, ...reporte } of reportesSeed) {
      await strapi.documents('api::reporte.reporte').create({
        data: { ...reporte, incidente: creado.documentId, autor: autores[autor] },
      });
      reportes++;
    }
  }

  strapi.log.info(`[seed] ${seed.incidentes.length} incidentes y ${reportes} reportes creados`);
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await asignarPermisos(strapi, 'public', PERMISOS_PUBLICOS);

    if (process.env.NODE_ENV !== 'production') {
      await seedUsuarios(strapi);
      await seedIncidentes(strapi);
    }

    // Después del seed, que es el que crea el rol Administrador
    await asignarPermisos(strapi, 'administrador', PERMISOS_ADMINISTRADOR);
  },
};
