# Decisiones del TP2

Registro de las decisiones tomadas durante el desarrollo. Se completa a medida que avanzamos.

Grupo Full Stack F.C. — Espinoza, Mellado, Retamal.

## Dominio

Tomamos como dominio nuestro trabajo final, SnapIt: una plataforma de reporte ciudadano sobre el estado de la vía pública, donde los vecinos informan obstáculos con foto y ubicación y el organismo de mantenimiento los gestiona hasta resolverlos. Acá resolvemos ese mismo dominio con otras herramientas, para poder comparar cómo se encara el problema con un CMS en vez de con un backend escrito a mano.

## CMS: Strapi

Nuestro proyecto final es una aplicación mobile que va a requerir un panel de administración para gestionar sus datos. Elegimos Strapi porque nos permite resolver ese backend sin desarrollarlo desde cero: genera automáticamente la API y el panel a partir de los modelos que definimos, e incluye autenticación y gestión de roles.

A diferencia de CMS tradicionales como WordPress, Drupal o Joomla, que están pensados para gestionar el contenido y también renderizar el sitio con sus propios temas, Strapi es un CMS headless por diseño: solo expone el contenido mediante una API REST o GraphQL. Si bien esos CMS pueden usarse en modo desacoplado a través de sus APIs, en ellos es una capacidad agregada, mientras que en Strapi es el enfoque central.

Esto es clave para nuestro caso. Con un CMS headless, la misma API que consume el dashboard web desarrollado con Next.js podría ser consumida también por una aplicación mobile, sin duplicar el backend. Lo planteamos como una ventaja del enfoque y no como algo que vayamos a implementar: nuestro trabajo final resuelve su backend con Express, Prisma y PostgreSQL. Además, Strapi nos permite trabajar con una arquitectura frontend–backend separada, similar a la que venimos usando en nuestros desarrollos recientes.

## Framework: Next.js

El frontend tiene que mostrar la vista de usuario del panel, así que buscamos un framework basado en React, que es la tecnología con la que ya venimos trabajando. Next.js trae resueltos el ruteo por archivos y la estructura del proyecto, y consumir una API REST externa es su caso de uso habitual.

Descartamos Angular porque implicaba adoptar otro modelo de componentes y otra forma de trabajo, sin una ventaja concreta para un proyecto de este tamaño. También evaluamos usar React solo con Vite, pero en ese caso el ruteo y la organización del proyecto quedan por nuestra cuenta, que es justamente lo que Next ya resuelve.

## Repositorio

Strapi y Next van en el mismo repositorio, para entregar un solo acceso a la cátedra y trabajar los tres sobre la misma base.

Para no pisarnos usamos ramas: `main` queda solo con lo que funciona y cada módulo se desarrolla en la suya. La configuración de entidades en Strapi es lo único realmente compartido, así que la definimos una sola vez entre los tres y no se modifica sin avisar.

## Base de datos y lenguaje

Usamos SQLite, porque el proyecto no tiene volumen ni concurrencia que justifiquen otra cosa y al ser un archivo local no obliga a que cada uno levante un motor de base aparte. El lenguaje es TypeScript.

El backend se inicia con `npx create-strapi@latest backend` y se levanta con `npm run develop`.

El frontend se inicia con `npx create-next-app@latest frontend` y se levanta con `npm run dev`. Elegimos TypeScript, igual que en Strapi, y el App Router, que es el sistema de ruteo que recomienda Next actualmente. No instalamos Tailwind: los estilos los va a definir el template CSS que todavía tenemos que elegir, y si lo agregábamos antes podía chocar con el CSS propio del template.

## Módulos

Implementamos tres, uno por integrante. Los elegimos de manera que sean tres operaciones distintas entre sí y no el mismo listado repetido.

**Listado y ficha.** Una página con las tarjetas de los incidentes en todos sus estados, no solo los abiertos, y otra con el detalle de cada uno. Es consumo directo de la API de Strapi.

**Filtros.** Tres selects de categoría, zona y estado. La búsqueda no se programa: se usa el filtrado que ya trae la API de Strapi pasando los parámetros correspondientes, por ejemplo `?filters[categoria][slug][$eq]=bache`.

**Indicadores.** Cuatro totales (incidentes totales, abiertos, cerrados y promedio de días de resolución) y un gráfico de torta por categoría, hecho con ApexCharts. Los datos se traen y se agregan en el cliente.

**Indicadores por período.** Además del resumen de Inicio, una sección del menú muestra las estadísticas de un rango de tiempo elegido: hoy, los últimos siete días, un día puntual, un mes o un año. Para ese rango calcula los reportes recibidos, los incidentes nuevos, los cerrados y el promedio de resolución de los que se cerraron, un gráfico de actividad agrupado por hora, día o mes, y los incidentes nuevos por categoría. El rango viaja en la URL, así se puede compartir. Las fechas se agrupan en hora de Argentina (UTC-3), porque Strapi las guarda en UTC y un reporte de las 22 h quedaría en el día siguiente. Como en Inicio, los datos se traen completos de la API y se agregan en el frontend.

**Acceso al panel.** El panel pide iniciar sesión y solo deja entrar a usuarios con el rol administrador. El login lo resuelve Users & Permissions (`/api/auth/local`); el frontend consulta `/api/users/me` para conocer el rol y guarda los tokens en cookies `httpOnly`, que el JavaScript del navegador no puede leer. El token de acceso dura diez minutos y el `proxy.ts` de Next lo renueva con el refresh token. La lectura pública de la API no cambia: el login protege el panel, no los datos, que siguen disponibles para una futura aplicación mobile.

**Usuarios.** Una página del panel lista los usuarios (activos, desactivados o todos) y permite cambiarles el nombre y desactivarlos. Desactivar usa el campo `blocked` de Users & Permissions: el usuario deja de poder iniciar sesión, pero sus reportes se conservan. A diferencia del resto de la API, `/api/users` no es público: el panel lo consulta con el token del administrador y solo envía el nombre y el estado, aunque el endpoint aceptaría también el rol o la contraseña. Un administrador no puede desactivarse a sí mismo. La cantidad de reportes de cada usuario se calcula en el frontend contando los reportes por autor, porque la relación está definida solo del lado del reporte.

**Cambio de estado de los incidentes.** Desde el listado y desde la ficha, el administrador puede pasar un incidente a abierto, en curso o cerrado. La fecha de cierre acompaña al estado: se completa con el momento del cierre y se borra si el incidente se reabre, para que el promedio de resolución de los indicadores siga siendo correcto. Como el resto de las escrituras, se hace con el token del administrador; la API pública sigue siendo solo de lectura.

Los dos primeros corresponden a la funcionalidad 3 (mapa público de incidentes) y el tercero a la 13 (panel de indicadores del organismo) de la lista de funcionalidades comprometida para nuestro trabajo final, lo que permite mostrar la equivalencia entre las dos implementaciones.

## Alcance

De SnapIt quedan afuera la inteligencia artificial, los mapas, el cálculo de recorridos y la aplicación móvil. Las primeras dependen de servicios externos y la consigna no permite interoperabilidad en este práctico; las otras necesitan PostGIS y Flutter, fuera de este stack.

## Modelo de datos

Las entidades son incidente, reporte, categoría y zona. Las imágenes de los reportes, que son opcionales, se resuelven con un campo de tipo Media en vez de una entidad propia, porque la Media Library de Strapi ya administra la carga y el almacenamiento.

Los usuarios tampoco se modelan: el plugin Users & Permissions que trae Strapi ya provee la colección de usuarios junto con los roles y permisos, y los tres perfiles de SnapIt (vecino, operador y administrador) se representan como roles.

## Plugins y librerías

- **Users & Permissions** (plugin de Strapi, viene instalado): usuarios, autenticación y los roles vecino, operador y administrador, con los permisos de cada uno sobre la API.
- **Media Library** (plugin Upload de Strapi, viene instalado): carga y almacenamiento de las fotos de los reportes.
- **ApexCharts** (con `react-apexcharts`): el gráfico de torta del módulo de indicadores. Al principio elegimos Recharts, que es la que usa nuestro trabajo final, pero TailAdmin ya trae ApexCharts para todos sus gráficos; usarla evita sumar una dependencia y mantiene la torta con el mismo estilo que el resto del template.

## Template CSS

Elegimos TailAdmin, en su versión gratuita para Next.js (licencia MIT). Usa las mismas versiones que nuestro frontend (Next 16, React 19 y Tailwind 4), es un panel de administración con tablas, tarjetas y gráficos, que es lo que necesitan los tres módulos, y está hecho con Tailwind, la misma librería de estilos que usa nuestro trabajo final.

Lo instalamos tal como viene en un commit aparte y lo capturamos antes de tocarlo, así se puede comparar con la versión adaptada.

Las modificaciones se anotan acá a medida que se hacen.

| Qué cambiamos | Dónde | Por qué |
| --- | --- | --- |
| Color de marca: del azul de TailAdmin al naranja | `globals.css` (paleta `brand` y colores fijos del calendario, el selector de fechas y el foco) | Es el color principal de SnapIt |
| Escala de grises: de gris azulado a gris neutro | `globals.css` (paleta `gray`) | El gris oscuro es el segundo color de SnapIt, también en el modo oscuro |
| Logo de TailAdmin reemplazado por el de SnapIt | `Logo.tsx`, `public/images/logo/snapit.png` y `snapit-icono.png` | La versión completa va en la barra lateral y el encabezado, y la reducida ("Sit") con la barra colapsada. Se generaron desde `docs/`, recortadas y con el fondo transparente para el modo oscuro |
| Menú reducido a Inicio, Incidentes, Indicadores y Usuarios | `AppSidebar.tsx`, `messages/es.json` | Las páginas de demostración no son parte de SnapIt; siguen en el código, pero fuera del menú |
| Se quitó la publicidad "Purchase Plan" | `AppSidebar.tsx`, `SidebarWidget.tsx` | Promociona la versión paga del template |
| Se quitaron las notificaciones y el usuario de ejemplo | `AppHeader.tsx` | Son datos falsos |
| El encabezado muestra el usuario con sesión iniciada y el botón para cerrarla | `AppHeader.tsx`, `PanelAdmin.tsx` (antes el layout de `(admin)`) | El panel requiere inicio de sesión |
| Formulario de inicio de sesión en español, sin Google, X, registro ni recuperación de contraseña | `SignInForm.tsx`, `signin/page.tsx` | Solo entran administradores ya creados en Strapi, con email y contraseña |
| Logo y lema de TailAdmin reemplazados en el panel lateral del login | `(auth)/layout.tsx` | Identidad del proyecto |
| Interfaz en español | `routing.ts`, `languages.ts`, `messages/es.json`, migas de pan | Los usuarios de SnapIt hablan español |
| Ícono de la pestaña con el logo reducido de SnapIt ("Sit") | `app/favicon.ico` (16, 32 y 48 px), `app/icon.png` (192 px) | Identidad del proyecto. Se generó desde `docs/logo-minimal-SnapIt.png`, recortado y con el fondo transparente |
| Títulos de pestaña y página 404 con SnapIt | metadata de las páginas, `not-found.tsx`, `error-404` | Identidad del proyecto |
| Dashboard de e-commerce de Inicio reemplazado por los indicadores | `(admin)/page.tsx`, `components/indicadores/` | Los datos del template eran de ejemplo; las tarjetas reusan su estilo con datos de la API. Los componentes de `ecommerce/` siguen en el código, fuera de la página |

## Datos de prueba

El panel de indicadores necesita alrededor de cincuenta incidentes cargados, con fechas repartidas y estados variados, y cargarlos a mano en cada máquina no tiene sentido. Los sembramos desde la función `bootstrap()` de Strapi leyendo un JSON versionado en el repositorio, así los tres tenemos los mismos datos y se pueden regenerar. Descartamos `strapi export` porque genera un archivo binario que no se versiona bien.
