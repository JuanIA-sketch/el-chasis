// Catálogo de tipos de proyecto — mismo patrón de "recetas" que
// instalador-un-clic/recetas/index.js: agregar un tipo nuevo = crear
// su módulo y sumarlo acá. Nada más.

import { cli } from './cli';

export type TipoProyecto = 'cli' | 'n8n' | 'web';

export interface TipoReceta {
  id: TipoProyecto;
  nombre: string;
  carpetas: string[];
  instalarHooks: boolean;
  templateReadme: string;
}

export const recetas: TipoReceta[] = [cli];

export function buscarReceta(tipo: string): TipoReceta | undefined {
  return recetas.find((receta) => receta.id === tipo);
}
