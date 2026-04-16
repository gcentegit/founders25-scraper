# Founders25 Scraper

Proyecto para scraping de datos de Founders25.

## Descripción

Este proyecto se encarga de extraer y procesar datos de la plataforma Founders25.

## Versionado Semántico

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
git commit -m "feat!: cambiar API de configuración
BREAKING CHANGE: La configuración ahora usa formato JSON en lugar de YAML"

# Cambios que no afectan versión
git commit -m "docs: actualizar README con nuevas instrucciones"
git commit -m "chore: actualizar dependencias"
```

### Flujo de Trabajo

1. Realiza tus cambios siguiendo las convenciones de commits
2. Haz push a la rama `master`
3. GitHub Actions detectará los cambios y ejecutará semantic-release automáticamente
4. Si hay cambios significativos, se creará un nuevo tag y release en GitHub
5. El CHANGELOG.md se actualizará automáticamente

### Instalación

```bash
# Próximamente
```

## Uso

```bash
# Próximamente
```

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue las convenciones de commits mencionadas arriba y abre un issue o pull request.
