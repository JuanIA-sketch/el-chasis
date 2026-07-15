// Catálogo de tipos de proyecto — mismo patrón de "recetas" que
// instalador-un-clic/recetas/index.js: agregar un tipo nuevo = crear
// su módulo y sumarlo acá. Nada más.

import { cli } from './cli.js';
import { n8n } from './n8n.js';
import { web } from './web.js';

export type TipoProyecto = 'cli' | 'n8n' | 'web';

export interface ArchivoTemplate {
  template: string; // ruta relativa dentro de src/templates/
  destino: string; // ruta relativa dentro del proyecto generado
}

export interface TipoReceta {
  id: TipoProyecto;
  nombre: string;
  carpetas: string[];
  instalarHooks: boolean;
  archivos: ArchivoTemplate[];
}

export const recetas: TipoReceta[] = [cli, n8n, web];

export function buscarReceta(tipo: string): TipoReceta | undefined {
  return recetas.find((receta) => receta.id === tipo);
}
