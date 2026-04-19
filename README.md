# Founders25 Scraper

Proyecto para scraping de datos de Founders25.

## Descripción

Este proyecto se encarga de extraer y procesar datos de la plataforma Founders25 utilizando técnicas avanzadas de scraping incluyendo scroll infinito y navegación de páginas individuales para maximizar la captura de contenido.

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

## Estructura del Repositorio

### En GitHub (versionado)
- `scraper.js` - Código principal del scraper
- `package.json` - Dependencias y scripts del proyecto
- `README.md` - Documentación del proyecto
- `.gitignore` - Configuración de exclusiones

### En Local (excluido de GitHub)
- `data/` - Datos scrapeados (CSV, JSON, imágenes)
  - `data/precios.csv` - Precios en formato CSV
  - `data/precios.json` - Precios en formato JSON
  - `data/lecciones.csv` - Lecciones en formato CSV
  - `data/lecciones.json` - Lecciones en formato JSON
  - `data/precios_images/` - Imágenes de precios
  - `data/lecciones_images/` - Imágenes de lecciones

### Por qué se excluye `data/` de GitHub

La carpeta `data/` está excluida del repositorio en el archivo `.gitignore` por las siguientes razones:

- **Datos dinámicos**: Los datos scrapeados cambian constantemente con cada ejecución
- **Commits innecesarios**: Cada ejecución del scraper generaría commits masivos de datos
- **Repositorio limpio**: Evita archivos grandes que no son código fuente
- **Práctica estándar**: En proyectos de scraping, los datos generados no se versionan

Los usuarios pueden generar los datos localmente ejecutando `npm run scrape`.

## Datos Extraídos

### Precios
- **Plan Gratuito**: Acceso gratuito con funcionalidades básicas
- **Plan Lite**: 5€/mes con funcionalidades extendidas
- **Plan Advanced**: 10€/mes con acceso completo
- **Plan Pro**: 22€/mes con mentoría y bolsa de trabajo
- **Plan Founder**: 499€ pago único con beneficios exclusivos

### Lecciones
- **25 lecciones** extraídas con:
  - Títulos, descripciones y URLs de video
  - Etiquetas (Acceso especial, niveles, categorías)
  - Duración, visualizaciones e imágenes de portada
  - **Captura mejorada**: Utiliza scroll infinito y navegación de páginas individuales

### Características del Scraper
- **Scroll Infinito**: Detecta automáticamente contenido dinámico
- **Navegación Individual**: Visita páginas de lecciones para encontrar más contenido
- **Deduplicación Robusta**: Evita duplicados con normalización de títulos
- **Extracción Completa**: Captura todos los datos disponibles públicamente

## Dependencias

- **puppeteer**: Para navegación con JavaScript y renderizado de contenido dinámico
- **cheerio**: Para parsing de HTML
- **axios**: Para descarga de archivos
- **csv-writer**: Para exportación a formato CSV

## Flujo de Trabajo

1. **Clone el repositorio**:
   ```bash
   git clone https://github.com/gcentegit/founders25-scraper.git
   cd founders25-scraper
   ```

2. **Instale las dependencias**:
   ```bash
   npm install
   ```

3. **Ejecute el scraper**:
   ```bash
   npm run scrape
   ```

4. **Acceda a los datos generados**:
   - Archivos CSV y JSON se generarán en la carpeta `data/`
   - Las imágenes se descargarán en `data/precios_images/` y `data/lecciones_images/`

5. **Actualice el repositorio** (si realizó cambios en el código):
   ```bash
   git add .
   git commit -m "feat: descripción de los cambios"
   git push origin master
   ```

**Nota**: No incluya la carpeta `data/` en los commits, ya que está excluida en `.gitignore`.

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue las convenciones de commits mencionadas arriba y abre un issue o pull request.