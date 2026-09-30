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

type RolSeed = { type: string; name: string; description: string };
type UsuarioSeed = { username: string; email: string; rol: string; bloqueado?: boolean };
type SeedUsuarios = { roles: RolSeed[]; password: string; usuarios: UsuarioSeed[] };

/**
 * Carga los roles y usuarios de prueba de database/seed/usuarios.json.
 * Es idempotente: solo crea lo que todavía no existe, así que se puede
 * correr en cada arranque sin duplicar datos.
 */
async function seedUsuarios(strapi: Core.Strapi) {
  const archivo = path.join(strapi.dirs.app.root, 'database', 'seed', 'usuarios.json');
  const seed: SeedUsuarios = JSON.parse(fs.readFileSync(archivo, 'utf8'));

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
    const rolPublico = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (rolPublico) {
      const existentes = await strapi.db
        .query('plugin::users-permissions.permission')
        .findMany({ where: { role: rolPublico.id, action: { $in: PERMISOS_PUBLICOS } } });
      const yaAsignados = new Set(existentes.map((permiso) => permiso.action));

      for (const action of PERMISOS_PUBLICOS.filter((a) => !yaAsignados.has(a))) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: rolPublico.id } });
      }
    }

    if (process.env.NODE_ENV !== 'production') await seedUsuarios(strapi);
  },
};
