#!/usr/bin/env node
// Entrada del wizard de El Chasis. Requiere `npm run build` (o el prepare
// de npm install), que compila src/ y copia hooks/templates a dist/.

const [mayor] = process.versions.node.split('.').map(Number);
if (mayor < 18) {
  console.error(
    `El Chasis necesita Node 18 o más nuevo (tenés la ${process.versions.node}).\n` +
      'Descargá la versión actual en https://nodejs.org y volvé a correrlo.'
  );
  process.exit(1);
}

const { correrWizard } = await import('../dist/wizard.js');
const { crearUiTerminal } = await import('../dist/terminal.js');

const ui = crearUiTerminal();
try {
  await correrWizard(ui, process.cwd());
} finally {
  ui.cerrar();
}
