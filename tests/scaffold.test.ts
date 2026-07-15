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

  it('genera un CLAUDE.md con las convenciones del proyecto', () => {
    crearProyecto('proyecto-prueba', 'cli', CARPETA_FIXTURES);

    const rutaClaude = join(DESTINO_PRUEBA, 'CLAUDE.md');
    expect(existsSync(rutaClaude)).toBe(true);

    const claude = readFileSync(rutaClaude, 'utf8');
    expect(claude).toContain('proyecto-prueba');
    expect(claude).toContain('TDD');
    expect(claude).toContain('Freno de Mano');
    expect(claude).toContain('Paraca');
  });

  it('crea la estructura workflows/ y tests/fixtures/ para un proyecto tipo n8n', () => {
    const resultado = crearProyecto('proyecto-prueba', 'n8n', CARPETA_FIXTURES);

    expect(resultado.ok).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'workflows'))).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'tests', 'fixtures'))).toBe(true);
    expect(readFileSync(join(DESTINO_PRUEBA, 'README.md'), 'utf8')).toContain('MIT');
    expect(readFileSync(join(DESTINO_PRUEBA, 'CLAUDE.md'), 'utf8')).toContain('workflows');
  });

  it('crea la estructura src/, public/ y vite.config.ts para un proyecto tipo web', () => {
    const resultado = crearProyecto('proyecto-prueba', 'web', CARPETA_FIXTURES);

    expect(resultado.ok).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'src'))).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'public'))).toBe(true);
    expect(existsSync(join(DESTINO_PRUEBA, 'vite.config.ts'))).toBe(true);
    expect(readFileSync(join(DESTINO_PRUEBA, 'README.md'), 'utf8')).toContain('MIT');
    expect(readFileSync(join(DESTINO_PRUEBA, 'CLAUDE.md'), 'utf8')).toContain('proyecto-prueba');
  });

  it('con un nombre tipo brief (prosa con espacios y puntuacion), falla con formato esperado y no crea nada', () => {
    const nombreBrief =
      'Generador de scaffolding para nuevos proyectos, con buenas prácticas ya instaladas: estructura y hooks.';

    expect(() => crearProyecto(nombreBrief, 'cli', CARPETA_FIXTURES)).toThrow(/mi-proyecto/);
    expect(existsSync(join(CARPETA_FIXTURES, nombreBrief))).toBe(false);
  });

  it('con un nombre de mas de 50 caracteres, falla aunque el formato sea valido', () => {
    const nombreLargo = 'proyecto-' + 'a'.repeat(50);

    expect(() => crearProyecto(nombreLargo, 'cli', CARPETA_FIXTURES)).toThrow(/50/);
    expect(existsSync(join(CARPETA_FIXTURES, nombreLargo))).toBe(false);
  });

  it('con un tipo de proyecto invalido, falla con mensaje claro y no crea nada', () => {
    expect(() =>
      crearProyecto('x', 'invalido' as any, CARPETA_FIXTURES)
    ).toThrow();
    expect(existsSync(join(CARPETA_FIXTURES, 'x'))).toBe(false);
  });
});
