// tsc no copia assets: los hooks vendoreados (.js/.json) y los templates
// (.md) tienen que viajar a dist/ para que bin/el-chasis.js funcione.

import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const desde = (ruta) => fileURLToPath(new URL(`../src/${ruta}`, import.meta.url));
const hacia = (ruta) => fileURLToPath(new URL(`../dist/${ruta}`, import.meta.url));

for (const carpeta of ['hooks', 'templates']) {
  cpSync(desde(carpeta), hacia(carpeta), { recursive: true });
}
console.log('Assets copiados a dist/ (hooks y templates).');
