# {{nombre}}

Proyecto Web/Vite generado con El Chasis. Estas convenciones vienen instaladas de fábrica — mantenerlas.

## Convenciones

- **TDD rojo→verde con Vitest**: no se escribe implementación antes de tener el test fallando. Los tests viven en `tests/`.
- **Hooks de seguridad activos** (config en `.claude/settings.json`):
  - **El Freno de Mano** avisa antes de ejecutar comandos peligrosos.
  - **El Paracaídas** guarda una snapshot automática antes de cada comando riesgoso.
  - Si alguno bloquea algo legítimo, ajustar el catálogo — no desactivar el hook.
- **Git**: `git push` y `gh repo create` requieren confirmación explícita, nunca automáticos.
- **Secretos**: nunca credenciales reales en el repo (API keys de servicios van en `.env`, que no se commitea). Al escanear en busca de credenciales, usar `grep -l` o `grep -q`, nunca `grep -n`.

## Estructura

- `src/` — código fuente
- `public/` — assets estáticos
- `tests/` — tests (arrancar acá: rojo primero)
- `vite.config.ts` — config de Vite
- `.claude/` — config de Claude Code y hooks
