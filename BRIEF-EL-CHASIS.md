# El Chasis — Brief de Proyecto (Juegos Imperiales)

## 1. Objetivo
Generador de scaffolding que crea nuevos proyectos con buenas prácticas ya instaladas: estructura de carpetas según tipo de proyecto, hooks de seguridad (El Freno de Mano + El Paracaídas), README con licencia, config de Claude Code apropiada, y esqueleto de tests listo para TDD desde el primer commit.

## 2. Para quién
Miembros de Imperio Agéntico que arrancan un proyecto nuevo y no saben (o no quieren perder tiempo) configurando hooks de seguridad, estructura de carpetas o TDD desde cero.

## 3. Alcance del MVP
Soporta 3 tipos de proyecto en la v1:
1. CLI (Node.js/TypeScript)
2. Workflow n8n
3. Web/Vite

**Fuera de alcance v1** (dejar para v2): apps Tauri, proyectos Python/Flask, detección automática de tipo por heurística de carpeta existente.

## 4. Qué instala el scaffolding
- Estructura de carpetas correcta según el tipo elegido
- Hooks de El Freno de Mano + El Paracaídas ya configurados y funcionales
- README.md con licencia MIT
- `.claude/` config apropiada para ese tipo de proyecto
- Esqueleto de tests (Vitest) listo para TDD rojo→verde

## 5. Decisión de arquitectura clave
No es copiar plantillas fijas. El CLI pregunta/infiere el tipo de proyecto y ajusta según eso: la config de Claude Code, la estructura de tests, y qué hooks aplican.

## 6. Criterio de "test verde" (TDD)
Dado un tipo de proyecto válido como input:
- Se crea la estructura de carpetas correcta para ese tipo (test de existencia de paths)
- Los hooks de Freno de Mano y Paracaídas quedan copiados y funcionales
- El README generado contiene licencia y estructura mínima esperada
- Con un tipo de proyecto inválido, el CLI falla con mensaje claro y no crea nada a medias

El repo ya trae `tests/scaffold.test.ts` cubriendo el primer y el último punto, en rojo. Ese es el punto de partida de mañana.

## 7. Flujo de trabajo
Brief (este doc) → Plan mode en Claude Code → TDD rojo→verde con Vitest → Demo con los 3 tipos de proyecto → Auditoría de git (solo fixtures sintéticos) → Publicar en GitHub (JuanIA-sketch) y npm si aplica.

## 8. No-negociables
- `git push` y `gh repo create` requieren tu confirmación explícita, nunca automáticos
- No hay secretos reales en la sesión de Claude Code, solo fixtures sintéticos
- Al escanear en busca de credenciales, usar `grep -l` o `grep -q`, nunca `grep -n`

## 9. Modelo sugerido
Fable 5 para el andamiaje multi-archivo (lógica de scaffolding + generación condicional). Sonnet para los tests unitarios puntuales.

## 10. Métrica antes/después para el post de la comunidad
**Antes:** armar un proyecto nuevo con buenas prácticas toma varios minutos a mano y es fácil saltarse un paso.
**Después:** un comando (`el-chasis create`) lo deja listo en segundos, sin pasos olvidados.

## 11. Decisiones resueltas (evidencia sacada de tus propios repos)
- **Wizard interactivo**: no hace falta librería externa. `instalador-un-clic/lib/wizard.js` ya lo resuelve con `node:readline` puro (incluye hasta el enmascarado de inputs sensibles). Reusar ese mismo patrón, no evaluar Inquirer/Clack/etc.
- **Estructura por tipo de proyecto**: adaptar el patrón de "recetas" de `instalador-un-clic` — un módulo por opción (`recetas/github.js`, `recetas/notion.js`...) con interfaz común, agregados en `recetas/index.js`, más un `motor.js` compartido. Es el mismo problema ("una cosa entre varias opciones") que ya resolviste para servicios; ahora aplica a tipos de proyecto (cli/n8n/web).
- **Cómo traer los hooks**: `freno-de-mano/install.js` ya define el mecanismo — copia el archivo del hook y hace merge cuidadoso en `.claude/settings.json` bajo `hooks.PreToolUse` (nunca sobreescribe un settings.json corrupto). El config (`freno-de-mano.config.json`) usa niveles `critico/alto/medio` con patrón regex + razón en español. Replicar ese mecanismo, no reinventarlo.

## 12. Nota de consistencia de stack
Freno de Mano, Paracaídas e Instalador de un Clic son JS puro **sin dependencias** — ni TypeScript ni framework de test, usan `node:test`. El Chasis quedó scaffolded en TypeScript + Vitest. Lo mantenemos así porque son dependencias de desarrollo (no viajan al usuario final que corre `npx el-chasis`) y la lógica condicional de 3 tipos se beneficia de tipado. Si preferís el mismo ADN cero-dependencias en todo el stack, se puede regenerar el scaffold en JS puro — avisar antes de que Fable 5 empiece.

## 13. Nota de arquitectura futura (no construir ahora)
El Chasis es la pieza de "ejecución" de un ciclo más grande: El Arquitecto (diagnóstico) → El Chasis (ejecución) → El Retrovisor (aprendizaje) → La Guantera (memoria compartida). Es contexto para el futuro, no un requisito de este sprint.

## 14. Recuperación de contexto
"Lee CLAUDE.md y BRIEF-EL-CHASIS.md. Entra en plan mode y arranca por el tipo CLI en tests/scaffold.test.ts."
