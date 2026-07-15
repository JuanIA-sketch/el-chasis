#!/usr/bin/env node
/**
 * 🪂 El Paracaídas — hook PreToolUse para Claude Code
 *
 * El Freno de Mano previene; El Paracaídas rescata. Este hook NUNCA bloquea
 * ni pregunta nada: cuando ve venir un comando 🔴 crítico o 🟠 alto, guarda
 * una snapshot física del proyecto ANTES de que se ejecute — fuera del repo,
 * en ~/.paracaidas/ — y deja un aviso discreto. Si el desastre igual ocurre,
 * la recuperación está a una frase en español de distancia.
 *
 * Catálogo de patrones: reusa el de El Freno de Mano si PARACAIDAS_CATALOGO
 * apunta a él; si no, usa la copia propia (paracaidas.config.json).
 */

'use strict';

const fs = require('fs');
const patrones = require('../lib/patrones');
const snapshot = require('../lib/snapshot');

function salir(objeto) {
  if (objeto) process.stdout.write(JSON.stringify(objeto));
  process.exit(0);
}

function main() {
  let crudo = '';
  try {
    crudo = fs.readFileSync(0, 'utf8');
  } catch (_) {
    crudo = '';
  }
  const evento = JSON.parse(crudo.trim() || '{}');

  const herramienta = evento.tool_name || '';
  if (herramienta !== 'Bash' && herramienta !== 'PowerShell') salir();

  const comando = String((evento.tool_input || {}).command || '');
  if (!comando) salir();

  const catalogo = patrones.cargarCatalogo();
  const critico = patrones.buscarMatch(catalogo.critico, comando);
  const alto = critico ? null : patrones.buscarMatch(catalogo.alto, comando);
  if (!critico && !alto) salir(); // sin peligro → sin fricción, cero rastro

  const resultado = snapshot.crear(process.cwd(), {
    comando_disparador: comando,
    herramienta,
    severidad: critico ? 'critico' : 'alto'
  });

  salir({
    systemMessage:
      '🪂 Paracaídas: guardé una snapshot de ' + resultado.entrada.archivos.length +
      ' archivos antes de este comando. Si algo sale mal, pídeme en español que lo recupere.'
  });
}

try {
  main();
} catch (error) {
  // Fail-open: un paracaídas roto jamás debe impedir trabajar.
  console.error('[paracaidas] no pude tomar la snapshot: ' + error.message);
  process.exit(0);
}
