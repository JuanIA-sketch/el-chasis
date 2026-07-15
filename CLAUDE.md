# El Chasis

Generador de scaffolding para nuevos proyectos con buenas prácticas ya instaladas: estructura de carpetas según tipo, hooks de seguridad, README con licencia, config de Claude Code, y esqueleto de tests para TDD desde el primer commit.

Contexto completo en `BRIEF-EL-CHASIS.md` — leerlo antes de tocar código.

## Estado actual
- Repo scaffolded, sin implementación todavía.
- `tests/scaffold.test.ts` tiene 2 tests en rojo — ese es el punto de partida.
- `src/index.ts` exporta `crearProyecto()` como stub que lanza error.
- `npm install && npm test` ya se corrió una vez para confirmar que el rojo es real (no un error de config).

## Próxima acción concreta
Entrar en plan mode y diseñar `crearProyecto()` para el tipo `cli` primero (ver criterios en BRIEF-EL-CHASIS.md, punto 6). Cuando pase ese test, seguir con `n8n` y `web`.

## Convenciones de este proyecto (heredadas del stack de Charly)
- TDD rojo→verde con Vitest. No se escribe implementación antes de tener el test.
- Modelo sugerido: Fable 5 para el motor de scaffolding (multi-archivo), Sonnet para tests puntuales.
- `git push` y `gh repo create` requieren tu confirmación explícita, nunca automáticos.
- No hay secretos reales en la sesión — solo fixtures sintéticos en `tests/fixtures/`.
- Al buscar credenciales, usar `grep -l` o `grep -q`, nunca `grep -n`.

## Decisiones resueltas (con referencias directas — leer antes de diseñar desde cero)
1. **Wizard**: reusar el patrón de `instalador-un-clic/lib/wizard.js` (node:readline puro, sin librería externa).
2. **Estructura por tipo**: adaptar el patrón de "recetas" de `instalador-un-clic/recetas/` (un módulo por opción + `motor.js` compartido) para cli/n8n/web.
3. **Instalación de hooks**: replicar el mecanismo de `freno-de-mano/install.js` — copia el hook y hace merge cuidadoso en `.claude/settings.json` bajo `hooks.PreToolUse`. Config con niveles `critico/alto/medio` en `freno-de-mano.config.json`.

## Nota de consistencia de stack
Freno de Mano, Paracaídas e Instalador de un Clic son JS puro sin dependencias (`node:test`, sin TypeScript). El Chasis usa TypeScript + Vitest — decisión mantenida porque son dependencias de desarrollo, no de runtime. Si se prefiere el mismo ADN cero-dependencias, regenerar el scaffold en JS puro antes de implementar.

## Relación con otros proyectos del reto (nota de arquitectura, no implementar ahora)
El Chasis es la pieza de "ejecución" de un ciclo más grande: El Arquitecto (diagnóstico) → El Chasis (ejecución) → El Retrovisor (aprendizaje) → La Guantera (memoria compartida). Es contexto para el futuro, no un requisito de este sprint.

## Comando de recuperación
"Lee CLAUDE.md y BRIEF-EL-CHASIS.md. Entra en plan mode y arranca por el tipo CLI en tests/scaffold.test.ts."
