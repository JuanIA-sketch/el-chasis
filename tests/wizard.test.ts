import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { formatearMenuTipos, correrWizard } from '../src/wizard';

const CARPETA_FIXTURES = join(__dirname, 'fixtures');
// Fixture propia: scaffold.test.ts corre en paralelo (un worker por archivo)
// y usa proyecto-prueba — compartir el destino produce carreras al limpiar.
const NOMBRE_PRUEBA = 'proyecto-wizard';
const DESTINO_PRUEBA = join(CARPETA_FIXTURES, NOMBRE_PRUEBA);

// UI falsa: cola de respuestas + captura de todo lo mostrado, sin terminal.
// Mismo enfoque que el instalador-un-clic: el flujo se testea inyectando la UI.
function uiFalsa(respuestas: string[]) {
  const mostrado: string[] = [];
  return {
    ui: {
      mostrar: (texto: string) => {
        mostrado.push(texto);
      },
      preguntar: async (prompt: string) => {
        mostrado.push(prompt);
        return respuestas.shift() ?? '';
      },
    },
    mostrado,
  };
}

describe('El Chasis - wizard interactivo', () => {
  afterEach(() => {
    if (existsSync(DESTINO_PRUEBA)) {
      rmSync(DESTINO_PRUEBA, { recursive: true, force: true });
    }
  });

  it('el menu numera cli, marca n8n/web como proximamente y cierra con salir', () => {
    const menu = formatearMenuTipos();
    expect(menu).toMatch(/1\) CLI/);
    expect(menu).toMatch(/n8n.*pr[oó]ximamente/i);
    expect(menu).toMatch(/[Ww]eb.*pr[oó]ximamente/i);
    expect(menu).toMatch(/0\) Salir/);
  });

  it('flujo completo: elige cli, pide nombre, crea el proyecto y sugiere el-doctor', async () => {
    const { ui, mostrado } = uiFalsa(['1', NOMBRE_PRUEBA]);

    await correrWizard(ui, CARPETA_FIXTURES);

    expect(existsSync(join(DESTINO_PRUEBA, 'src'))).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'CLAUDE.md'))).toBe(true);
    const salida = mostrado.join('\n');
    expect(salida).toContain('el-doctor');
  });

  it('elegir una opcion proximamente avisa y vuelve a preguntar sin crear nada', async () => {
    const { ui, mostrado } = uiFalsa(['2', '1', NOMBRE_PRUEBA]);

    await correrWizard(ui, CARPETA_FIXTURES);

    expect(mostrado.join('\n')).toMatch(/pr[oó]ximamente/i);
    expect(existsSync(join(DESTINO_PRUEBA, 'src'))).toBe(true);
  });

  it('con 0 sale sin crear nada', async () => {
    const { ui } = uiFalsa(['0']);

    await correrWizard(ui, CARPETA_FIXTURES);

    expect(existsSync(DESTINO_PRUEBA)).toBe(false);
  });

  it('con nombre invalido muestra el error y vuelve a preguntar el nombre', async () => {
    const { ui, mostrado } = uiFalsa(['1', 'nombre/malo', NOMBRE_PRUEBA]);

    await correrWizard(ui, CARPETA_FIXTURES);

    expect(mostrado.join('\n')).toContain('inválido');
    expect(existsSync(join(DESTINO_PRUEBA, 'src'))).toBe(true);
  });

  it('nombre vacio (EOF) cancela sin crear nada', async () => {
    const { ui } = uiFalsa(['1', '']);

    await correrWizard(ui, CARPETA_FIXTURES);

    expect(existsSync(DESTINO_PRUEBA)).toBe(false);
  });
});
