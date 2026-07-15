// El motor del scaffolding: dado una receta ya validada, materializa el
// proyecto en disco. Si algo falla a mitad de camino, borra la raíz entera
// (siempre es nueva, validado antes de escribir) — nunca queda nada a medias.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { instalarHooks } from './instalador-hooks.js';
import type { TipoReceta } from './tipos/index.js';

const DIR_TEMPLATES = fileURLToPath(new URL('./templates/', import.meta.url));

export interface ResultadoScaffold {
  ok: boolean;
  rutasCreadas: string[];
}

export function ejecutarReceta(
  receta: TipoReceta,
  nombre: string,
  destino: string
): ResultadoScaffold {
  const raiz = join(destino, nombre);
  if (existsSync(raiz)) {
    throw new Error(
      `Ya existe "${raiz}" — no se tocó nada. Elegí otro nombre o borrá esa carpeta.`
    );
  }

  const rutasCreadas: string[] = [];
  try {
    mkdirSync(raiz, { recursive: true });
    rutasCreadas.push(raiz);
    for (const carpeta of receta.carpetas) {
      const ruta = join(raiz, carpeta);
      mkdirSync(ruta, { recursive: true });
      rutasCreadas.push(ruta);
    }
    if (receta.instalarHooks) {
      rutasCreadas.push(...instalarHooks(raiz));
    }
    for (const archivo of receta.archivos) {
      const template = readFileSync(join(DIR_TEMPLATES, archivo.template), 'utf8');
      const ruta = join(raiz, archivo.destino);
      writeFileSync(ruta, template.replaceAll('{{nombre}}', nombre));
      rutasCreadas.push(ruta);
    }
  } catch (error) {
    rmSync(raiz, { recursive: true, force: true });
    throw error;
  }

  return { ok: true, rutasCreadas };
}
