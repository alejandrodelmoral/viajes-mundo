# Blog de Viajes

Este es un blog estático para publicar artículos de viajes usando archivos Markdown.

El blog se encuentra clicando [aquí](https://alejandrodelmoral.github.io/viajes-mundo/).

---

## Cómo subir nuevos artículos

1. **Subir el archivo Markdown**

   - Sube el archivo `.md` con el contenido del artículo en la carpeta `entries/`.
   - Por ejemplo: `entries/2025_07_Roma.md`

2. **Añadir la entrada al listado**

   - Abre el archivo `js/config.json`.
   - Añade un nuevo objeto con los datos del viaje en el año correspondiente.

    ```json
    {
        "name": "Roma, Italia",
        "image": "assets/2025/roma.jpg",
        "date": "Julio 2025",
        "file": "2025/2025_07_Roma.md"
    }
    ```

    - Guarda el archivo.

3. **Recargar la página**

    - La web cargará automáticamente la nueva entrada y aparecerá en el blog.

---

## Estructura del proyecto

- `index.html`: Página principal.
- `js/main.js`: Lógica JavaScript.
- `js/config.json`: Configuración de los viajes (lista de entradas).
- `entries/`: Carpeta con los archivos Markdown de cada viaje.
- `assets/`: Imágenes utilizadas en las tarjetas y artículos.
- `css/style.css`: Estilos CSS.
