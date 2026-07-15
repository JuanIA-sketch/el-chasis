// Instala El Freno de Mano y El Paracaídas en un proyecto generado.
// Replica el mecanismo de freno-de-mano/install.js y paracaidas/install.js:
// copiar los archivos del hook y hacer merge cuidadoso en .claude/settings.json
// bajo hooks.PreToolUse — nunca pisar un settings.json corrupto ni hooks ajenos,
// e idempotente (correrlo dos veces no duplica nada).
//
// Única desviación deliberada: el comando usa $CLAUDE_PROJECT_DIR en vez de
// ruta absoluta, porque el proyecto generado se va a mover/clonar.

import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR_ASSETS = fileURLToPath(new URL('./hooks/', import.meta.url));

const HOOKS = [
  {
    origen: 'freno-de-mano',
    destinoRelativo: join('.claude', 'hooks'),
    archivo: 'freno-de-mano.js',
    matcher: 'Bash|PowerShell|Read|Edit|Write',
    comando: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/freno-de-mano.js"',
  },
  {
    origen: 'paracaidas',
    destinoRelativo: join('.claude', 'paracaidas'),
    archivo: 'paracaidas.js',
    matcher: 'Bash|PowerShell',
    comando: 'node "$CLAUDE_PROJECT_DIR/.claude/paracaidas/hooks/paracaidas.js"',
  },
];

interface EntradaHook {
  type: string;
  command: string;
}

interface EntradaPreToolUse {
  matcher?: string;
  hooks?: EntradaHook[];
}

function leerSettings(ruta: string): Record<string, any> {
  if (!existsSync(ruta)) return {};
  try {
    return JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (error) {
    throw new Error(
      `El settings.json en "${ruta}" tiene un error de formato JSON — no se tocó para no empeorar nada. ` +
        `Detalle: ${(error as Error).message}`
    );
  }
}

function registrarHook(
  settings: Record<string, any>,
  archivo: string,
  matcher: string,
  comando: string
): void {
  if (!settings.hooks) settings.hooks = {};
  if (!Array.isArray(settings.hooks.PreToolUse)) settings.hooks.PreToolUse = [];

  const esDeEsteHook = (h: EntradaHook) =>
    h && typeof h.command === 'string' && h.command.includes(archivo);

  const entradaExistente = (settings.hooks.PreToolUse as EntradaPreToolUse[]).find(
    (e) => Array.isArray(e.hooks) && e.hooks.some(esDeEsteHook)
  );

  if (entradaExistente) {
    entradaExistente.matcher = matcher;
    entradaExistente.hooks = entradaExistente.hooks!.map((h) =>
      esDeEsteHook(h) ? { type: 'command', command: comando } : h
    );
  } else {
    settings.hooks.PreToolUse.push({
      matcher,
      hooks: [{ type: 'command', command: comando }],
    });
  }
}

export function instalarHooks(raizProyecto: string): string[] {
  const rutaSettings = join(raizProyecto, '.claude', 'settings.json');

  // Leer settings ANTES de copiar nada: si está corrupto, no se toca nada.
  const settings = leerSettings(rutaSettings);

  const rutasCreadas: string[] = [];
  for (const hook of HOOKS) {
    const destino = join(raizProyecto, hook.destinoRelativo);
    cpSync(join(DIR_ASSETS, hook.origen), destino, { recursive: true });
    rutasCreadas.push(destino);
    registrarHook(settings, hook.archivo, hook.matcher, hook.comando);
  }

  writeFileSync(rutaSettings, JSON.stringify(settings, null, 2) + '\n');
  rutasCreadas.push(rutaSettings);
  return rutasCreadas;
}
