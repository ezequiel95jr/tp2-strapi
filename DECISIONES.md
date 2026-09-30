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

**Indicadores.** Cuatro totales (incidentes totales, abiertos, cerrados y promedio de días de resolución) y un gráfico de torta por categoría, hecho con Recharts, la misma librería de gráficos que usa nuestro trabajo final. Los datos se traen y se agregan en el cliente.

Los dos primeros corresponden a la funcionalidad 3 (mapa público de incidentes) y el tercero a la 13 (panel de indicadores del organismo) de la lista de funcionalidades comprometida para nuestro trabajo final, lo que permite mostrar la equivalencia entre las dos implementaciones.

## Alcance

De SnapIt quedan afuera la inteligencia artificial, los mapas, el cálculo de recorridos y la aplicación móvil. Las primeras dependen de servicios externos y la consigna no permite interoperabilidad en este práctico; las otras necesitan PostGIS y Flutter, fuera de este stack.

## Modelo de datos

Las entidades son incidente, reporte, categoría y zona. Las imágenes de los reportes, que son opcionales, se resuelven con un campo de tipo Media en vez de una entidad propia, porque la Media Library de Strapi ya administra la carga y el almacenamiento.

Los usuarios tampoco se modelan: el plugin Users & Permissions que trae Strapi ya provee la colección de usuarios junto con los roles y permisos, y los tres perfiles de SnapIt (vecino, operador y administrador) se representan como roles.

## Plugins y librerías

- **Users & Permissions** (plugin de Strapi, viene instalado): usuarios, autenticación y los roles vecino, operador y administrador, con los permisos de cada uno sobre la API.
- **Media Library** (plugin Upload de Strapi, viene instalado): carga y almacenamiento de las fotos de los reportes.
- **Recharts** (librería de React): el gráfico de torta del módulo de indicadores.

## Template CSS

*Pendiente de elegir.* Antes de modificarlo hay que instalarlo tal como viene y capturarlo, porque la consigna pide mostrarlo sin ninguna modificación para poder comparar.

Las modificaciones se anotan acá a medida que se hacen.

| Qué cambiamos | Dónde | Por qué |
| --- | --- | --- |
| | | |

## Datos de prueba

El panel de indicadores necesita alrededor de cincuenta incidentes cargados, con fechas repartidas y estados variados, y cargarlos a mano en cada máquina no tiene sentido. Los sembramos desde la función `bootstrap()` de Strapi leyendo un JSON versionado en el repositorio, así los tres tenemos los mismos datos y se pueden regenerar. Descartamos `strapi export` porque genera un archivo binario que no se versiona bien.
