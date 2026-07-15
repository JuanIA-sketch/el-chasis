import { buscarReceta, recetas } from './tipos/index';
import { ejecutarReceta } from './motor';
import type { TipoProyecto } from './tipos/index';
import type { ResultadoScaffold } from './motor';

export type { TipoProyecto, TipoReceta } from './tipos/index';
export type { ResultadoScaffold } from './motor';

/**
 * Crea la estructura de un nuevo proyecto segun su tipo.
 * Valida todo antes de escribir: con input inválido no se crea nada.
 */
export function crearProyecto(
  nombre: string,
  tipo: TipoProyecto,
  destino: string
): ResultadoScaffold {
  const receta = buscarReceta(tipo);
  if (!receta) {
    const disponibles = recetas.map((r) => r.id).join(', ');
    throw new Error(
      `Tipo de proyecto inválido: "${tipo}". Tipos disponibles: ${disponibles}. No se creó nada.`
    );
  }
  if (!nombre.trim() || /[\\/]/.test(nombre)) {
    throw new Error(
      `Nombre de proyecto inválido: "${nombre}". Usá un nombre sin barras ni espacios vacíos. No se creó nada.`
    );
  }
  return ejecutarReceta(receta, nombre, destino);
}
