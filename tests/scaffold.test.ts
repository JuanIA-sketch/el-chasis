import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { crearProyecto } from '../src/index';

const CARPETA_FIXTURES = join(__dirname, 'fixtures');
const DESTINO_PRUEBA = join(CARPETA_FIXTURES, 'proyecto-prueba');

describe('El Chasis - scaffolding de tipo CLI', () => {
  afterEach(() => {
    if (existsSync(DESTINO_PRUEBA)) {
      rmSync(DESTINO_PRUEBA, { recursive: true, force: true });
    }
  });

  it('crea la estructura src/ y tests/ para un proyecto tipo CLI', () => {
    const resultado = crearProyecto('proyecto-prueba', 'cli', CARPETA_FIXTURES);

    expect(resultado.ok).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'src'))).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'tests'))).toBe(true);
  });

  it('copia los hooks de Freno de Mano y Paracaidas a .claude/', () => {
    crearProyecto('proyecto-prueba', 'cli', CARPETA_FIXTURES);

    expect(existsSync(join(DESTINO_PRUEBA, '.claude', 'hooks', 'freno-de-mano.js'))).toBe(true);
    expect(
      existsSync(join(DESTINO_PRUEBA, '.claude', 'hooks', 'freno-de-mano.config.json'))
    ).toBe(true);
    expect(
      existsSync(join(DESTINO_PRUEBA, '.claude', 'paracaidas', 'hooks', 'paracaidas.js'))
    ).toBe(true);
  });

  it('registra ambos hooks en .claude/settings.json bajo hooks.PreToolUse', () => {
    crearProyecto('proyecto-prueba', 'cli', CARPETA_FIXTURES);

    const rutaSettings = join(DESTINO_PRUEBA, '.claude', 'settings.json');
    expect(existsSync(rutaSettings)).toBe(true);

    const settings = JSON.parse(readFileSync(rutaSettings, 'utf8'));
    const comandos: string[] = settings.hooks.PreToolUse.flatMap((entrada: any) =>
      entrada.hooks.map((h: any) => h.command)
    );
    expect(comandos.some((c) => c.includes('freno-de-mano.js'))).toBe(true);
    expect(comandos.some((c) => c.includes('paracaidas.js'))).toBe(true);
  });

  it('genera un README.md con el nombre del proyecto y licencia MIT', () => {
    crearProyecto('proyecto-prueba', 'cli', CARPETA_FIXTURES);

    const rutaReadme = join(DESTINO_PRUEBA, 'README.md');
    expect(existsSync(rutaReadme)).toBe(true);

    const readme = readFileSync(rutaReadme, 'utf8');
    expect(readme).toContain('proyecto-prueba');
    expect(readme).toContain('MIT');
  });

  it('con un tipo de proyecto invalido, falla con mensaje claro y no crea nada', () => {
    expect(() =>
      crearProyecto('x', 'invalido' as any, CARPETA_FIXTURES)
    ).toThrow();
    expect(existsSync(join(CARPETA_FIXTURES, 'x'))).toBe(false);
  });
});
