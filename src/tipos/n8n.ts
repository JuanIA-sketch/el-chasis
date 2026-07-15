import type { TipoReceta } from './index.js';

export const n8n: TipoReceta = {
  id: 'n8n',
  nombre: 'Workflow n8n',
  carpetas: ['workflows', 'tests', 'tests/fixtures'],
  instalarHooks: true,
  archivos: [
    { template: 'n8n/README.md', destino: 'README.md' },
    { template: 'n8n/CLAUDE.md', destino: 'CLAUDE.md' },
  ],
};
