// Adaptador de terminal — subset del patrón de instalador-un-clic/lib/wizard.js:
// UNA sola interfaz readline compartida con cola de líneas propia (rl.question
// pierde las líneas que llegan sin pregunta pendiente, típico con input pegado
// o por pipe). Sin enmascarado: El Chasis no pide secretos.

import readline from 'node:readline';
import type { UiWizard } from './wizard.js';

let rl: readline.Interface | null = null;
const cola: string[] = [];
let esperando: ((linea: string) => void) | null = null;
let cerrado = false;

function obtenerRl(): readline.Interface {
  if (rl) return rl;
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: process.stdin.isTTY === true,
  });
  rl.on('line', (linea) => {
    if (esperando) {
      const resolver = esperando;
      esperando = null;
      resolver(linea);
    } else {
      cola.push(linea);
    }
  });
  rl.on('SIGINT', () => {
    process.stdout.write('\nCancelado. No se creó nada a medias.\n');
    process.exit(0);
  });
  // Fin del input (EOF): las preguntas pendientes resuelven vacío, que en
  // todo el flujo significa "salir" o "cancelar".
  rl.on('close', () => {
    cerrado = true;
    if (esperando) {
      const resolver = esperando;
      esperando = null;
      resolver('');
    }
  });
  return rl;
}

function siguienteLinea(): Promise<string> {
  if (cola.length > 0) return Promise.resolve(cola.shift()!);
  if (cerrado) return Promise.resolve('');
  return new Promise((resolve) => {
    esperando = resolve;
  });
}

async function preguntar(prompt: string): Promise<string> {
  const interfaz = obtenerRl();
  if (cerrado) {
    process.stdout.write(prompt);
  } else {
    interfaz.setPrompt(prompt);
    interfaz.prompt();
  }
  return (await siguienteLinea()).trim();
}

function cerrar(): void {
  if (rl) {
    rl.close();
    rl = null;
  }
}

export function crearUiTerminal(): UiWizard & { cerrar: () => void } {
  return {
    mostrar: (texto: string) => console.log(texto),
    preguntar,
    cerrar,
  };
}
