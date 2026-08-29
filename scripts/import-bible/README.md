# Importador bíblico de Alienta

Este proceso genera `assets/data/alienta-bible.db` a partir de archivos VPL descargados directamente de eBible.org. No acepta archivos bíblicos proporcionados manualmente ni copias de repositorios de terceros.

## Fuentes aprobadas

| ID | Traducción | Idioma | Canon | Licencia |
| --- | --- | --- | --- | --- |
| `rvr1909` | Reina-Valera 1909 | Español | Protestante, 66 libros | Dominio público |
| `webp` | World English Bible — Protestant Edition | Inglés | Protestante, 66 libros | Dominio público |

Los términos materiales de cada licencia están conservados en `licenses/`. El manifiesto fija URL, fecha de verificación, conteo esperado y SHA-256 del ZIP oficial.

## Requisitos

- Node.js 22.5 o superior, con `node:sqlite`.
- `unzip`, incluido en GitHub Codespaces.
- Acceso de red a `https://ebible.org` solo durante la generación.

## Ejecución

```bash
npm run bible:validate
npm run bible:build
```

El importador detiene el proceso si cambia el hash, la licencia no cumple el manifiesto, el canon no contiene exactamente 66 libros en orden, falta un capítulo, aparece una referencia duplicada o cambia el conteo de versículos. Un cambio legítimo en el archivo fuente exige revisar nuevamente la página oficial y actualizar el manifiesto de forma explícita.

La generación también actualiza `assets/data/alienta-bible.manifest.json` con los conteos aprobados, las huellas de las fuentes y el SHA-256 definitivo de la base empaquetada.

La app nunca descarga estos textos en tiempo de ejecución. El archivo SQLite validado se empaqueta con la aplicación y permite leer y buscar sin conexión.
