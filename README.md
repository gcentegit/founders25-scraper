# Founders25 Scraper

Proyecto para scraping de datos de Founders25.

## Descripción

Este proyecto se encarga de extraer y procesar datos de la plataforma Founders25.

## Versionado Semántico (SEMVER)

Este proyecto utiliza [semantic-release](https://github.com/semantic-release/semantic-release) para automatizar el control de versiones siguiendo el estándar [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH).

### Convenciones de Commits

El versionado se determina automáticamente basándose en los mensajes de commit:

- **`feat:`** - Nueva funcionalidad → Incrementa MINOR
- **`fix:`** - Corrección de bug → Incrementa PATCH
- **`feat!:`** o **`fix!:`** con `BREAKING CHANGE:` en body → Incrementa MAJOR
- **`docs:`, `style:`, `refactor:`, `test:`, `chore:`** - No cambian la versión

### Ejemplos de Commits

```bash
# Nueva funcionalidad (versión 0.1.0)
git commit -m "feat: agregar módulo de extracción de datos"

# Corrección de bug (versión 0.1.1)
git commit -m "fix: corregir error en parsing de HTML"

# Cambio breaking (versión 1.0.0)
git commit -m "feat!: cambiar API de configuración"
	BREAKING CHANGE: La configuración ahora usa formato JSON en lugar de YAML"

# Cambios que no afectan versión
git commit -m "docs: actualizar README con nuevas instrucciones"
git commit -m "chore: actualizar dependencias"
```

### Flujo de Trabajo

1. Realiza tus cambios siguiendo las convenciones de commits mencionadas arriba
2. Haz push a la rama `master`
3. GitHub Actions detectará los cambios y ejecutará semantic-release automáticamente
4. Si hay cambios significativos, se creará un nuevo tag y release en GitHub
5. El CHANGELOG.md se actualizará automáticamente

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar el scraper
npm run scrape
```

## Uso

```bash
# Ejecutar el scraper
npm run scrape

# Este comando generará:
# - data/precios.csv - Datos de precios en formato CSV
# - data/precios.json - Datos de precios en formato JSON
# - data/lecciones.csv - Datos de lecciones en formato CSV
# - data/lecciones.json - Datos de lecciones en formato JSON
# - data/lecciones_images/ - Imágenes de las lecciones descargadas
```

## Datos Extraídos

### Precios
- **Plan Gratuito**: Acceso gratuito con funcionalidades básicas
- **Plan Lite**: 5€/mes con funcionalidades extendidas
- **Plan Advanced**: 10€/mes con acceso completo
- **Plan Pro**: 22€/mes con mentoría y bolsa de trabajo
- **Plan Founder**: 499€ pago único con beneficios exclusivos

### Lecciones
- **12 lecciones** extraídas con:
  - Títulos, descripciones y URLs de video
  - Etiquetas (Acceso especial, niveles, categorías)
  - Duración, visualizaciones e imágenes de portada

## Dependencias

- **puppeteer**: Para navegación con JavaScript
- **cheerio**: Para parsing de HTML
- **axios**: Para descarga de archivos
- **csv-writer**: Para exportación a formato CSV

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue las convenciones de commits mencionadas arriba y abre un issue o pull request.