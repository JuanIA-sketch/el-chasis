# {{nombre}}

Proyecto CLI (Node.js/TypeScript) generado con [El Chasis](https://github.com/JuanIA-sketch) — estructura, hooks de seguridad y TDD listos desde el primer commit.

## Estructura

- `src/` — código fuente
- `tests/` — tests (TDD rojo→verde)
- `.claude/` — config de Claude Code con El Freno de Mano y El Paracaídas ya instalados

## Hooks de seguridad incluidos

- **El Freno de Mano**: avisa antes de ejecutar comandos peligrosos (catálogo en `.claude/hooks/freno-de-mano.config.json`).
- **El Paracaídas**: guarda una snapshot automática del proyecto antes de cada comando riesgoso.

Si tenés una sesión de Claude Code abierta, reiniciala para que cargue los hooks.

## Licencia

MIT
