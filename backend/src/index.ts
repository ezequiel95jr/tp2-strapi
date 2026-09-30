import type { Core } from '@strapi/strapi';

// Acciones de solo lectura que el rol Public puede usar en la API REST.
// Los permisos se guardan en la base de datos y no viajan por Git, por eso
// se crean al arrancar: así cada instalación del grupo los tiene sin
// configurarlos a mano en el panel.
const PERMISOS_PUBLICOS = ['categoria', 'zona', 'incidente', 'reporte'].flatMap((nombre) => [
  `api::${nombre}.${nombre}.find`,
  `api::${nombre}.${nombre}.findOne`,
]);

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

    if (!rolPublico) return;

    const existentes = await strapi.db
      .query('plugin::users-permissions.permission')
      .findMany({ where: { role: rolPublico.id, action: { $in: PERMISOS_PUBLICOS } } });
    const yaAsignados = new Set(existentes.map((permiso) => permiso.action));

    for (const action of PERMISOS_PUBLICOS.filter((a) => !yaAsignados.has(a))) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: rolPublico.id } });
    }
  },
};
