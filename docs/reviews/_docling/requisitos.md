## Tailspin Toys · Especificación de requisitos del catálogo

v1.2 · 30 de septiembre de 2026 · Estado: aprobado por el comité de producto

|   Versión | Fecha      | Cambios                                     |
|-----------|------------|---------------------------------------------|
|       1.0 | 12/05/2026 | Primera versión aprobada.                   |
|       1.1 | 03/07/2026 | Añade la página de detalle y la página 404. |
|       1.2 | 30/09/2026 | Añade los apartados 4 y 5.                  |

## 1. Introducción

Tailspin Toys es una plataforma de crowdfunding de juegos de mesa con temática de desarrollo de software. Este documento recoge los requisitos del sitio web del catálogo: qué debe mostrar y con qué calidad. Lo mantiene el equipo de producto y sirve de referencia al equipo web.

## 2. Glosario

Juego: Título de mesa con temática de desarrollo de software que busca financiación en la plataforma.

Categoría: Género del juego, como Strategy, Card Game o Puzzle. Sirve para agrupar el catálogo.

Editor: Estudio o empresa que publica el juego y solicita la financiación.

Valoración: Puntuación del juego. Es opcional: un juego nuevo puede no tenerla.

## 3. Requisitos funcionales

| ID    | Requisito                                                                                                                                              |
|-------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| RF-01 | La página principal muestra todos los juegos del catálogo ordenados alfabéticamente por título.                                                        |
| RF-02 | Cada tarjeta del catálogo muestra el título, las categorías, el editor y el inicio de la descripción, y enlaza con la página de detalle del juego.     |
| RF-03 | Un juego puede pertenecer a varias categorías. La tarjeta y la página de detalle muestran todas las categorías del juego.                              |
| RF-04 | Cada juego tiene un único editor.                                                                                                                      |
| RF-05 | La página de detalle de cada juego está en la ruta /game/{id} y muestra el título, la valoración, las categorías, el editor y la descripción completa. |
| RF-06 | La página de detalle incluye el botón «Support This Game». En esta versión el botón no tramita aportaciones (ver apartado 5).                          |
| RF-07 | Si un juego no tiene valoración, no se muestra ninguna valoración en su página de detalle.                                                             |
| RF-08 | El sitio incluye una página «About» que presenta Tailspin Toys.                                                                                        |
| RF-09 | Una ruta inexistente muestra una página 404 con el diseño del sitio.                                                                                   |

## 4. Requisitos no funcionales

| ID     | Requisito                                                                                                                                                   |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| RNF-01 | El catálogo se actualiza en tiempo real: cualquier cambio en los datos de un juego se ve en la web en menos de 5 segundos, sin volver a desplegar el sitio. |

| ID     | Requisito                                                                                                                        |
|--------|----------------------------------------------------------------------------------------------------------------------------------|
| RNF-02 | Los datos del catálogo se guardan en una base de datos SQLite local, que se carga a partir del fichero games.csv.                |
| RNF-03 | La valoración de cada juego se calcula de forma determinista, para que dos compilaciones del sitio produzcan el mismo resultado. |
| RNF-04 | El sitio cumple las pautas WCAG 2.1 de nivel AA y se puede recorrer entero con el teclado.                                       |
| RNF-05 | El catálogo se adapta al ancho de pantalla: una columna en móvil, dos en tableta y tres en escritorio.                           |
| RNF-06 | Las pruebas unitarias cubren la capa de datos y las pruebas end-to-end se ejecutan contra el sitio compilado.                    |

## 5. Fuera de alcance

Esta versión no incluye:

- Búsqueda, filtrado, ordenación y paginación del catálogo: se planifican para la versión 1.3.
- Páginas propias de cada editor.
- Tramitación de aportaciones y pasarela de pago.
- Cuentas de usuario y valoraciones de los usuarios.
