# {{nombre}}

Proyecto de workflows n8n generado con El Chasis — estructura, hooks de seguridad y convenciones listas desde el primer commit.

## Estructura

- `workflows/` — los workflows exportados desde n8n como JSON (uno por archivo)
- `tests/` — validación de los workflows (JSON parseable, sin credenciales embebidas)
- `tests/fixtures/` — credenciales **sintéticas** para pruebas, nunca reales
- `.claude/` — config de Claude Code con El Freno de Mano y El Paracaídas ya instalados

## Flujo de trabajo

1. Armá o modificá el workflow en n8n.
2. Exportalo como JSON a `workflows/`.
3. Antes de commitear, auditá que el export no traiga credenciales embebidas.

## Licencia

MIT
