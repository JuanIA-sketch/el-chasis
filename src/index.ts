import { buscarReceta, recetas } from './tipos/index.js';
import { ejecutarReceta } from './motor.js';
import type { TipoProyecto } from './tipos/index.js';
import type { ResultadoScaffold } from './motor.js';

export type { TipoProyecto, TipoReceta } from './tipos/index.js';
export type { ResultadoScaffold } from './motor.js';

// Formato de nombre tipo carpeta/paquete (freno-de-mano, el-doctor):
// letras, números, guiones, guiones bajos y puntos. Nada de espacios ni
// puntuación de prosa — pegar un brief entero como nombre debe fallar claro.
const FORMATO_NOMBRE = /^[a-zA-Z0-9._-]+$/;
const LARGO_MAXIMO_NOMBRE = 50;

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
  if (!FORMATO_NOMBRE.test(nombre) || nombre.length > LARGO_MAXIMO_NOMBRE) {
    const mostrado = nombre.length > 40 ? nombre.slice(0, 40) + '…' : nombre;
    throw new Error(
      `Nombre de proyecto inválido: "${mostrado}". ` +
        `Usá hasta ${LARGO_MAXIMO_NOMBRE} caracteres con letras, números, guiones, guiones bajos o puntos ` +
        `(por ejemplo: mi-proyecto). No se creó nada.`
    );
  }
  return ejecutarReceta(receta, nombre, destino);
}
