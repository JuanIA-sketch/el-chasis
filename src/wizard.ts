// El wizard de El Chasis — flujo interactivo con UI inyectada, testeable
// sin terminal (mismo enfoque que instalador-un-clic: la entrada real
// inyecta readline; los tests inyectan una UI falsa con respuestas en cola).

import { crearProyecto } from './index.js';
import { recetas } from './tipos/index.js';
import type { TipoReceta } from './tipos/index.js';

export interface UiWizard {
  mostrar: (texto: string) => void;
  preguntar: (prompt: string) => Promise<string>;
}

// Tipos del brief que todavía no están implementados: se anuncian en el
// menú pero no se pueden elegir. Cuando un tipo se implementa, sale de
// acá y entra al catálogo de src/tipos/.
export const PROXIMAMENTE = ['Workflow n8n', 'Web/Vite'];

export function formatearMenuTipos(
  disponibles: TipoReceta[] = recetas,
  proximamente: string[] = PROXIMAMENTE
): string {
  const lineas = disponibles.map((receta, i) => `  ${i + 1}) ${receta.nombre}`);
  proximamente.forEach((nombre, i) => {
    lineas.push(`  ${disponibles.length + i + 1}) ${nombre}   (próximamente)`);
  });
  lineas.push('  0) Salir');
  return lineas.join('\n');
}

async function elegirTipo(ui: UiWizard): Promise<TipoReceta | null> {
  while (true) {
    ui.mostrar('¿Qué tipo de proyecto querés crear?\n');
    ui.mostrar(formatearMenuTipos());
    const eleccion = (await ui.preguntar('\nElegí un número: ')).trim();
    if (eleccion === '0' || eleccion === '') return null;

    const indice = Number(eleccion) - 1;
    if (Number.isInteger(indice) && indice >= 0 && indice < recetas.length) {
      return recetas[indice];
    }
    if (indice >= recetas.length && indice < recetas.length + PROXIMAMENTE.length) {
      ui.mostrar(
        `\n${PROXIMAMENTE[indice - recetas.length]} llega próximamente — por ahora el tipo disponible es CLI.\n`
      );
    } else {
      ui.mostrar(
        `\n"${eleccion}" no es una opción del menú — probá con un número del 0 al ${
          recetas.length + PROXIMAMENTE.length
        }.\n`
      );
    }
  }
}

export async function correrWizard(ui: UiWizard, destino: string): Promise<void> {
  ui.mostrar('\n🚗 EL CHASIS — proyectos nuevos con buenas prácticas de fábrica\n');

  const receta = await elegirTipo(ui);
  if (!receta) {
    ui.mostrar('\nListo, no se creó nada.\n');
    return;
  }

  // Reintento ante error: la persona corrige el nombre sin volver al menú.
  while (true) {
    const nombre = (await ui.preguntar('\nNombre del proyecto: ')).trim();
    if (nombre === '') {
      ui.mostrar('\nCancelado. No se creó nada.\n');
      return;
    }
    try {
      const resultado = crearProyecto(nombre, receta.id, destino);
      ui.mostrar('\n✅ Proyecto creado:\n' + resultado.rutasCreadas.map((r) => `   ${r}`).join('\n'));
      ui.mostrar(
        `\n💡 Sugerencia: corré el-doctor sobre ${nombre} para un chequeo de salud del proyecto nuevo.`
      );
      ui.mostrar('\nℹ️  Al abrir Claude Code en el proyecto, los hooks ya van a estar activos.\n');
      return;
    } catch (error) {
      ui.mostrar(`\n⚠️  ${(error as Error).message}`);
    }
  }
}
