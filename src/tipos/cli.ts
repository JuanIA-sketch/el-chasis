import type { TipoReceta } from './index';

export const cli: TipoReceta = {
  id: 'cli',
  nombre: 'CLI (Node.js/TypeScript)',
  carpetas: ['src', 'tests'],
  instalarHooks: true,
  templateReadme: 'cli/README.md',
};
