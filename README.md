# El Chasis

Generador de scaffolding para nuevos proyectos con buenas prácticas ya instaladas: estructura de carpetas según el tipo, hooks de seguridad (El Freno de Mano + El Paracaídas), README y CLAUDE.md con convenciones, y licencia MIT — todo listo desde el primer commit.

## Estado
MVP completo — soporta los 3 tipos del brief: CLI (Node.js/TypeScript), Workflow n8n y Web/Vite. Parte del reto Juegos Imperiales (Imperio Agéntico).

## Instalación

```
npx el-chasis
```

O, si preferís tenerlo instalado:

```
npm install -g el-chasis
el-chasis
```

## Uso

Corré `el-chasis` parado en la carpeta donde querés crear el proyecto. El wizard te guía:

```
🚗 EL CHASIS — proyectos nuevos con buenas prácticas de fábrica

¿Qué tipo de proyecto querés crear?

  1) CLI (Node.js/TypeScript)
  2) Workflow n8n
  3) Web/Vite
  0) Salir

Elegí un número: 1

Nombre del proyecto: mi-proyecto

✅ Proyecto creado:
   /ruta/donde/estabas/mi-proyecto
   /ruta/donde/estabas/mi-proyecto/src
   /ruta/donde/estabas/mi-proyecto/tests
   /ruta/donde/estabas/mi-proyecto/.claude/hooks
   /ruta/donde/estabas/mi-proyecto/.claude/paracaidas
   /ruta/donde/estabas/mi-proyecto/.claude/settings.json
   /ruta/donde/estabas/mi-proyecto/README.md
   /ruta/donde/estabas/mi-proyecto/CLAUDE.md

💡 Sugerencia: corré el-doctor sobre mi-proyecto para un chequeo de salud del proyecto nuevo.
```

Cada tipo crea su estructura propia (workflows/ y fixtures sintéticos para n8n; src/, public/ y vite.config.ts para web) y deja los hooks de El Freno de Mano y El Paracaídas ya registrados en `.claude/settings.json` — al abrir Claude Code en el proyecto nuevo, la protección ya está activa.

## Desarrollo

```
npm install
npm test
```

Ver `BRIEF-EL-CHASIS.md` para el contexto completo del proyecto.

## Licencia
MIT
