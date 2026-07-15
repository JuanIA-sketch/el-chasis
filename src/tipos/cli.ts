import type { TipoReceta } from './index.js';

export const cli: TipoReceta = {
  id: 'cli',
  nombre: 'CLI (Node.js/TypeScript)',
  carpetas: ['src', 'tests'],
  instalarHooks: true,
  archivos: [
    { template: 'cli/README.md', destino: 'README.md' },
    { template: 'cli/CLAUDE.md', destino: 'CLAUDE.md' },
  ],
};
