---
name: paracaidas
description: Usar cuando el usuario pide recuperar, rescatar o volver a una versión anterior de su proyecto en lenguaje natural ("recupérame como estaba antes de que rompiera el login", "tráeme la versión de ayer que sí funcionaba", "deshaz el desastre"), o cuando un comando destructivo acaba de dañar el proyecto. También al llegar a un proyecto nuevo, para generar su perfil inteligente de snapshots.
---

# 🪂 El Paracaídas — Recuperación por lenguaje natural (Capa 1)

El Freno de Mano previene; tú, con esta skill, rescatas. Las snapshots ya
existen (el hook las tomó automáticamente antes de cada comando peligroso).
Tu trabajo es razonar CUÁL snapshot quiere el usuario y restaurarla con
confirmación.

Toda interacción es en español sencillo, tono pedagógico — mismo estilo que
El Freno de Mano. El usuario probablemente acaba de perder trabajo y está
asustado: primero tranquiliza ("tu proyecto tiene snapshots, esto tiene
arreglo"), después actúa.

## Rutas

- CLI: `node <carpeta-de-esta-skill>/../../cli.js` — córrelo siempre con el
  directorio de trabajo en la raíz del proyecto del usuario.
- Las snapshots viven FUERA del proyecto, en `~/.paracaidas/<id-proyecto>/`
  (o `PARACAIDAS_HOME` si está definida). Por eso sobreviven aunque el
  proyecto entero se haya destruido.

## Flujo de recuperación

1. **Lee el catálogo**: `cli.js listar --json`. Cada entrada trae `id`,
   `timestamp`, `comando_disparador`, `severidad`, `archivos` (rutas
   relativas), `mensaje_contexto` y `tipoProyecto`.

2. **Razona la intención del usuario contra los metadatos.** No le pidas un
   timestamp exacto — cruza tú las pistas:
   - "antes de que rompiera el login" → busca snapshots cuyos `archivos`
     toquen login/auth, o cuyo `comando_disparador` explique el daño.
   - "la versión de ayer que sí funcionaba" → filtra por `timestamp` de ayer;
     si hay varias, prefiere la última de ayer.
   - "deshaz el desastre" → casi siempre es la snapshot más reciente con
     `severidad` critico o alto: se tomó justo ANTES del comando que dañó.
   - Una entrada con `severidad: "seguridad"` es el estado previo a una
     restauración anterior — sirve para deshacer una restauración equivocada.

3. **Propón UNA snapshot y explica por qué** en una frase: qué comando la
   disparó, cuándo, y por qué encaja con lo que pidió el usuario. Si hay dos
   candidatas realmente ambiguas, muestra ambas y pregunta.

4. **Muestra el plan quirúrgico antes de pedir confirmación.** Corre
   `cli.js restaurar <id>` SIN `--si`: imprime qué se va a sobrescribir (✏️,
   archivos que difieren, con pista de recencia), qué se va a recrear (♻️,
   borrados) y qué queda intacto (✅ idénticos, 🆕 creados después).
   Muéstraselo al usuario tal cual. Si entre los ✏️ hay archivos con
   "modificado hace X min" muy fresco que el usuario reconoce como trabajo
   legítimo posterior al desastre, proponle protegerlos con
   `--excepto ruta1,ruta2`.

5. **Confirma antes de tocar nada.** Solo con el sí explícito del usuario
   corre: `cli.js restaurar <id> --si [--excepto ruta1,ruta2]`. Nunca
   inventes el `--si` sin que el usuario haya confirmado.

6. **Cierra con el diagnóstico.** El CLI ya imprime el post-mortem (📋):
   qué comando causó el desastre, cuándo, por qué era peligroso y qué volvió.
   Apóyate en él para tranquilizar: cuántos archivos volvieron, y que el
   estado anterior quedó en la snapshot de seguridad (di su id) por si se
   arrepiente.

## Reglas duras

- NUNCA muestres el contenido de archivos de la snapshot (`.env`, configs con
  claves) en la conversación. Habla de rutas y conteos, no de contenidos.
- NUNCA restaures sin confirmación explícita del usuario.
- Los archivos 🆕 (creados después de la snapshot) y los protegidos con
  `--excepto` JAMÁS se restauran — son trabajo legítimo del usuario. La
  restauración es quirúrgica: solo toca lo que difiere o desapareció.
- Si `listar` devuelve vacío, dilo honestamente: el Paracaídas no tiene
  snapshots de este proyecto todavía. No inventes alternativas mágicas;
  sugiere instalar el hook para la próxima.

## Perfil inteligente (Capa 4 — tu otra mitad)

Si `cli.js perfil` dice que el proyecto usa la heurística de emergencia,
genera tú el perfil (esta es la inteligencia cacheada del motor):

1. Mira el proyecto: manifiestos (package.json, pyproject.toml…), estructura
   de carpetas, qué es fuente y qué es regenerable (builds, datasets crudos,
   binarios, caches del framework).
2. Escribe el perfil en la ruta que `cli.js perfil` indicó, con este formato:

```json
{
  "version": 1,
  "tipoProyecto": "node",
  "excluir": ["node_modules", "dist", ".next", "coverage", "datos-crudos"],
  "umbralArchivoMB": 10,
  "topeTotalMB": 200,
  "razonamiento": "Una frase en español: por qué excluiste lo que excluiste."
}
```

3. Reglas: `excluir` lleva nombres de carpetas/archivos regenerables o
   pesados de ESTE proyecto (no una lista genérica); `.git` y `.paracaidas`
   se excluyen solos, no hace falta listarlos; jamás excluyas `.env` ni
   configs — son exactamente lo que git no protege y el Paracaídas sí.
