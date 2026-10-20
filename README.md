# 50 vueltas al sol

Una historia web para el 50 cumpleaños de Oihane. Se abre desde el móvil, con un código QR impreso en una tarjeta, y va revelando el regalo poco a poco.

No es una página comercial. No reserva vuelos, alojamientos ni retiros, y no envía la elección a ningún sitio.

## Verla en local

Hace falta un servidor sencillo. Abre una terminal en esta carpeta y ejecuta:

```bash
python -m http.server 5500
```

Entra en `http://localhost:5500`.

Las tipografías, las animaciones de scroll y el confeti se cargan desde internet. Las fotografías están en el proyecto. Si falla la conexión con esos servicios, el texto, la carta y la apertura del regalo siguen funcionando; solo se pierden la letra fina, el movimiento al hacer scroll y el confeti.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube estos archivos a la rama principal. La raíz del repositorio debe contener `index.html`.
2. En el repositorio: **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Elige la rama principal y la carpeta **/ (root)**. Guarda.
5. Espera a que termine el despliegue. La dirección será parecida a `https://tu-usuario.github.io/nombre-del-repositorio/`.
6. Comprueba esa dirección en el móvil antes de imprimir el QR.
7. Genera el código QR con la URL completa, incluida la barra final si el navegador la muestra.

El archivo `.nojekyll` evita que GitHub Pages procese el sitio con Jekyll y rompa las carpetas que empiezan por guion bajo. Las rutas de la página son relativas, así que funcionan tanto en un repositorio de proyecto como en un sitio de usuario.

`noindex` pide a los buscadores que no indexen la página. No impide que alguien con el enlace la abra: no es una medida de privacidad.

Cuando la URL ya exista, puedes cambiar `og:image` y `twitter:image` en `index.html` por la dirección absoluta de `assets/images/og.jpg`. Así, si el enlace se pega en un chat, la vista previa muestra el amanecer y no el destino.

## Personalizar los textos

Casi todo el texto está en `index.html`:

- Portada, carta y despedida.
- Las dos experiencias: descripción, lugares, actividades y duración.
- El mensaje que aparece al marcar una favorita está en `js/main.js`, en la función `choiceMessage`. Conviene mantener la idea de que la elección solo queda guardada en el dispositivo.

No hace falta nombrar a quien regala si no quieres. La dedicatoria cierra con «Con todo nuestro amor.»

## Fotografías

Están en `assets/images/` y se pueden sustituir manteniendo el nombre del archivo, o cambiando la ruta en `index.html`.

| Archivo | Uso | Qué debe mostrar | Tamaño de referencia |
| --- | --- | --- | --- |
| `amanecer.webp` | Portada | Un amanecer o un paisaje amplio. Sin monumentos ni señales que delaten el destino. | 1080 × 1440 |
| `og.jpg` | Vista previa al compartir el enlace | El mismo tipo de imagen, apaisada. Tampoco debe revelar el regalo. | 1200 × 630 |
| `revelacion.webp` | Al abrir el sobre | La fotografía más emocionante del destino. | 1200 × 1500 |
| `opcion-a.webp` | El corazón del yoga | Delhi, Agra o Rishikesh. | 1400 × 1020 |
| `opcion-b.webp` | Naturaleza y bienestar | Kerala o Munnar. | 1280 × 960 |

Conviene usar WebP en la página y JPG solo en la imagen de la vista previa. Un peso orientativo razonable en el móvil es menos de 250 KB por fotografía.

### Créditos de las fotos actuales

Licencia de [Unsplash](https://unsplash.com/license). La atribución no es obligatoria.

- Portada y vista previa: [Jenya Shportiak](https://unsplash.com/photos/misty-morning-landscape-with-trees-and-sun-splN74VxiZE), amanecer con niebla en Zakarpattia.
- Revelación: [Rohit Dey](https://unsplash.com/photos/the-taj-mahal-emerges-from-the-early-morning-fog-o_bVKfgTa_s), el Taj Mahal entre la niebla.
- Opción A: [Jaimik Thakkar](https://unsplash.com/photos/a-view-of-a-river-and-mountains-from-a-hill-XapcBSM1mzM), el Ganges en Rishikesh.
- Opción B: [Vivek Kuppa](https://unsplash.com/photos/rolling-green-tea-fields-at-sunrise-with-mountains-Ai-hiKCfCVE), plantaciones de té en Munnar.

## La elección

Al pulsar «Esta experiencia me ilusiona», la preferencia se guarda en `localStorage` con la clave `oihane-50-favorita`. Solo vive en ese navegador. Se puede cambiar. No se envía a ningún servidor y no significa que el viaje esté reservado.

«Copiar mi elección» usa la API del portapapeles. Si el navegador no la permite, aparece el texto para copiarlo a mano.

«Volver a vivir la sorpresa» regresa al inicio y cierra el regalo para poder abrirlo otra vez. No borra la preferencia guardada.

## Movimiento

Las apariciones al hacer scroll usan GSAP y ScrollTrigger. El confeti solo sale al abrir el regalo, después de pulsar. En el escritorio ancho hay un parallax muy corto en la portada; en el móvil no.

Si el sistema pide menos movimiento, el sobre se abre sin animación, no hay confeti y el scroll no es suave. Si GSAP no carga, el texto de la carta sigue visible.

## Qué no incluye

- Música.
- Formularios.
- Analítica, cookies de seguimiento ni claves de API.
- Confirmación de vuelos, hoteles, retiros o pagos.
