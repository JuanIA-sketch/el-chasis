# {{nombre}}

Proyecto CLI (Node.js/TypeScript) generado con El Chasis. Estas convenciones vienen instaladas de fábrica — mantenerlas.

## Convenciones

- **TDD rojo→verde con Vitest**: no se escribe implementación antes de tener el test fallando. El esqueleto de tests vive en `tests/`.
- **Hooks de seguridad activos** (config en `.claude/settings.json`):
  - **El Freno de Mano** avisa antes de ejecutar comandos peligrosos — catálogo de patrones en `.claude/hooks/freno-de-mano.config.json` (niveles `critico/alto/medio`).
  - **El Paracaídas** guarda una snapshot automática antes de cada comando riesgoso.
  - Si alguno bloquea algo legítimo, ajustar el catálogo — no desactivar el hook.
- **Git**: `git push` y `gh repo create` requieren confirmación explícita, nunca automáticos.
- **Secretos**: nunca credenciales reales en el repo ni en sesiones de Claude Code — solo fixtures sintéticos. Al escanear en busca de credenciales, usar `grep -l` o `grep -q`, nunca `grep -n`.

## Estructura

- `src/` — código fuente
- `tests/` — tests (arrancar acá: rojo primero)
- `.claude/` — config de Claude Code y hooks
