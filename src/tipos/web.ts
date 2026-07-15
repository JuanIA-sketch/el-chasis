import type { TipoReceta } from './index.js';

export const web: TipoReceta = {
  id: 'web',
  nombre: 'Web/Vite',
  carpetas: ['src', 'public', 'tests'],
  instalarHooks: true,
  archivos: [
    { template: 'web/README.md', destino: 'README.md' },
    { template: 'web/CLAUDE.md', destino: 'CLAUDE.md' },
    { template: 'web/vite.config.ts', destino: 'vite.config.ts' },
  ],
};
