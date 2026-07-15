# {{nombre}}

Proyecto de workflows n8n generado con El Chasis. Estas convenciones vienen instaladas de fábrica — mantenerlas.

## Convenciones

- **Workflows en `workflows/`**: cada workflow exportado desde n8n vive como un JSON propio. El nombre del archivo describe qué hace el workflow.
- **Cero credenciales en los exports**: n8n exporta referencias a credenciales, no secretos — pero auditar cada export antes de commitear igual. Al escanear en busca de credenciales, usar `grep -l` o `grep -q`, nunca `grep -n`.
- **Fixtures sintéticos en `tests/fixtures/`**: cualquier credencial o payload de prueba es inventado, nunca real.
- **Hooks de seguridad activos** (config en `.claude/settings.json`):
  - **El Freno de Mano** avisa antes de ejecutar comandos peligrosos.
  - **El Paracaídas** guarda una snapshot automática antes de cada comando riesgoso.
  - Si alguno bloquea algo legítimo, ajustar el catálogo — no desactivar el hook.
- **Git**: `git push` y `gh repo create` requieren confirmación explícita, nunca automáticos.

## Estructura

- `workflows/` — JSONs exportados desde n8n
- `tests/` — validación de workflows
- `tests/fixtures/` — datos de prueba sintéticos
- `.claude/` — config de Claude Code y hooks
