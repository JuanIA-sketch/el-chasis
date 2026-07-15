#!/usr/bin/env node
/**
 * 🪂 CLI de El Paracaídas.
 *
 * Comandos (siempre sobre el proyecto del directorio actual):
 *   listar [--json]        snapshots disponibles (--json: contrato para la Capa 1)
 *   snapshot [mensaje]     snapshot manual con mensaje de contexto opcional
 *   restaurar <id> [--si] [--excepto a,b]  restauración quirúrgica; sin --si
 *                          solo imprime el plan (qué se toca y qué no)
 *   limpiar [--conservar N] [--si]  purga snapshots automáticas viejas; sin
 *                          --si solo muestra qué purgaría
 *   perfil                 dónde vive (o viviría) el perfil inteligente del proyecto
 */

'use strict';

const fs = require('fs');
const catalogo = require('./lib/catalogo');
const perfil = require('./lib/perfil');
const postmortem = require('./lib/postmortem');
const retencion = require('./lib/retencion');
const snapshot = require('./lib/snapshot');
const restaurar = require('./lib/restaurar');

const AYUDA = [
  '🪂 El Paracaídas — snapshots y recuperación independientes de git',
  '',
  'Uso: node cli.js <comando>',
  '',
  '  listar [--json]        snapshots de este proyecto',
  '  snapshot [mensaje]     tomar una snapshot manual ahora',
  '  restaurar <id> [--si] [--excepto a,b]   restauración quirúrgica (sin --si: solo muestra el plan)',
  '  limpiar [--conservar N] [--si]          purga automáticas viejas (sin --si: solo muestra qué purgaría)',
  '  perfil                 estado del perfil inteligente (Capa 4)'
].join('\n');

function listar(args) {
  const entradas = catalogo.leer(process.cwd());
  if (args.includes('--json')) {
    console.log(JSON.stringify(entradas, null, 2));
    return 0;
  }
  if (entradas.length === 0) {
    console.log('Todavía no hay snapshots de este proyecto.');
    return 0;
  }
  for (const e of entradas) {
    console.log(
      e.id + '  ' + e.timestamp + '  [' + (e.severidad || '-') + ']  ' +
      (e.mensaje_contexto || e.comando_disparador || 'sin contexto') +
      '  (' + e.archivos.length + ' archivos)'
    );
  }
  return 0;
}

function snapshotManual(args) {
  const mensaje = args.join(' ').trim();
  const { entrada } = snapshot.crear(process.cwd(), Object.assign({
    comando_disparador: 'snapshot manual',
    herramienta: 'cli',
    severidad: 'manual'
  }, mensaje ? { mensaje_contexto: mensaje } : {}));
  console.log('🪂 Snapshot ' + entrada.id + ' guardada (' + entrada.archivos.length + ' archivos).');
  return 0;
}

function tiempoRelativo(mtimeMs) {
  const min = Math.round((Date.now() - mtimeMs) / 60000);
  if (min < 1) return 'hace menos de 1 min';
  if (min < 60) return 'hace ' + min + ' min';
  const horas = Math.round(min / 60);
  if (horas < 24) return 'hace ' + horas + ' h';
  return 'hace ' + Math.round(horas / 24) + ' días';
}

function imprimirPlan(id, plan) {
  const e = plan.entrada;
  console.log('🪂 Plan de restauración quirúrgica — snapshot ' + id + ' (' + e.timestamp + ')');
  console.log('   Disparada por: "' + (e.comando_disparador || 'sin comando') + '"  [' + (e.severidad || '-') + ']');
  console.log('');
  if (plan.modificados.length > 0) {
    console.log('Se van a sobrescribir (' + plan.modificados.length + ') — su contenido actual difiere de la snapshot:');
    for (const m of plan.modificados) console.log('   ✏️ ' + m.rel + '  (modificado ' + tiempoRelativo(m.mtimeMs) + ')');
  }
  if (plan.borrados.length > 0) {
    console.log('Se van a recrear (' + plan.borrados.length + ') — estaban en la snapshot y ya no existen:');
    for (const rel of plan.borrados) console.log('   ♻️ ' + rel);
  }
  console.log('Se quedan exactamente como están:');
  console.log('   ✅ ' + plan.identicos.length + ' archivos idénticos a la snapshot');
  if (plan.nuevos.length > 0) {
    console.log('   🆕 ' + plan.nuevos.length + ' archivos creados después de la snapshot: ' + plan.nuevos.join(', '));
  }
  console.log('');
  console.log('Nada se toca todavía. Antes de restaurar se guarda una snapshot de seguridad.');
  console.log('Confirma con:            restaurar ' + id + ' --si');
  console.log('Para proteger archivos:  restaurar ' + id + ' --si --excepto ruta1,ruta2');
}

function restaurarCmd(args) {
  const posicionales = [];
  const excepto = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--si') continue;
    if (args[i] === '--excepto') {
      excepto.push(...String(args[++i] || '').split(',').filter(Boolean));
      continue;
    }
    posicionales.push(args[i]);
  }
  const id = posicionales[0];
  if (!id) {
    console.error('Falta el id de la snapshot. Corre "listar" para verlas.');
    return 1;
  }

  if (!args.includes('--si')) {
    const plan = restaurar.planear(process.cwd(), id);
    if (plan.modificados.length + plan.borrados.length === 0) {
      console.log('🪂 Tu proyecto ya está idéntico a la snapshot "' + id + '". No hay nada que restaurar.');
      return 0;
    }
    imprimirPlan(id, plan);
    return 1;
  }

  const resultado = restaurar.restaurar(process.cwd(), id, { excepto });
  if (!resultado.snapshotSeguridad) {
    console.log('🪂 Tu proyecto ya está idéntico a la snapshot "' + id + '". No toqué nada.');
    return 0;
  }
  console.log(
    '🪂 Restauración quirúrgica completa: ' + resultado.restaurados.length + ' sobrescritos, ' +
    resultado.recreados.length + ' recreados, ' + resultado.intactos.length + ' intactos' +
    (resultado.nuevos.length > 0 ? ', ' + resultado.nuevos.length + ' nuevos respetados' : '') +
    (resultado.respetados.length > 0 ? ', ' + resultado.respetados.length + ' protegidos por --excepto' : '') + '.\n' +
    'Snapshot de seguridad del estado anterior: ' + resultado.snapshotSeguridad.id + ' (por si te arrepientes).'
  );
  console.log('');
  console.log(postmortem.generar(resultado.entrada, resultado));
  return 0;
}

function limpiarCmd(args) {
  let conservar = retencion.LIMITE_AUTOMATICAS;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--conservar') {
      const n = parseInt(args[++i], 10);
      if (isNaN(n) || n < 0) {
        console.error('--conservar necesita un número (cuántas automáticas conservar).');
        return 1;
      }
      conservar = n;
    }
  }

  if (!args.includes('--si')) {
    const { purgables, conservadas, protegidas } = retencion.plan(process.cwd(), { conservar });
    if (purgables.length === 0) {
      console.log(
        '🪂 Nada que purgar: hay ' + conservadas + ' snapshots automáticas (el límite es ' +
        conservar + ') y ' + protegidas + ' manuales/de seguridad, que jamás se purgan.'
      );
      return 0;
    }
    console.log('🪂 Se purgarían ' + purgables.length + ' snapshots automáticas (las más viejas):');
    for (const e of purgables) {
      console.log('   🗑️ ' + e.id + '  ' + e.timestamp + '  "' + (e.comando_disparador || 'sin comando') + '"');
    }
    console.log('Se conservan las ' + conservadas + ' automáticas más recientes y las ' +
      protegidas + ' manuales/de seguridad (esas jamás se purgan).');
    console.log('Confirma con:  limpiar' + (args.length ? ' ' + args.join(' ') : '') + ' --si');
    return 1;
  }

  const resultado = retencion.purgar(process.cwd(), { conservar });
  if (resultado.purgadas.length === 0) {
    console.log('🪂 Nada que purgar. No toqué nada.');
    return 0;
  }
  console.log(
    '🪂 Purgadas ' + resultado.purgadas.length + ' snapshots automáticas viejas. Quedan ' +
    resultado.conservadas + ' automáticas y ' + resultado.protegidas +
    ' manuales/de seguridad (intactas, como siempre).'
  );
  return 0;
}

function perfilCmd() {
  const ruta = perfil.rutaPerfil(process.cwd());
  const cargado = perfil.cargar(process.cwd());
  if (cargado.origen === 'perfil') {
    console.log('Perfil inteligente activo: ' + ruta);
  } else {
    console.log(
      'Este proyecto todavía usa la heurística de emergencia.\n' +
      'Cuando Fable 5 genere el perfil, debe guardarlo en: ' + ruta
    );
  }
  return 0;
}

function main() {
  const [comando, ...args] = process.argv.slice(2);
  switch (comando) {
    case 'listar': return listar(args);
    case 'snapshot': return snapshotManual(args);
    case 'restaurar': return restaurarCmd(args);
    case 'limpiar': return limpiarCmd(args);
    case 'perfil': return perfilCmd();
    default:
      console.log(AYUDA);
      return comando ? 1 : 0;
  }
}

try {
  process.exit(main());
} catch (error) {
  console.error('❌ ' + error.message);
  process.exit(1);
}
