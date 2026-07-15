'use strict';
/**
 * Restauración quirúrgica de El Paracaídas — Capa 2.
 *
 * Ya no se sobrescribe todo: el diff clasifica y solo se tocan los archivos
 * que difieren (restaurados) o desaparecieron (recreados). Lo idéntico y lo
 * creado después de la snapshot queda intacto. `excepto` protege archivos que
 * el usuario editó legítimamente aunque difieran.
 *
 * Regla de oro intacta: si hay algo que tocar, ANTES se toma una snapshot de
 * seguridad del estado actual. Si no hay nada que tocar, cero efectos.
 */

const fs = require('fs');
const path = require('path');
const diff = require('./diff');
const snapshot = require('./snapshot');

/** Plan de restauración sin efectos: qué se tocaría y qué no. */
function planear(rutaProyecto, id) {
  return diff.calcular(rutaProyecto, id);
}

/** Restaura quirúrgicamente el proyecto al estado de la snapshot `id`. */
function restaurar(rutaProyecto, id, opciones) {
  const raiz = path.resolve(rutaProyecto);
  const excepto = new Set((opciones && opciones.excepto) || []);
  const plan = diff.calcular(raiz, id);

  const restaurados = plan.modificados.map((m) => m.rel).filter((r) => !excepto.has(r));
  const recreados = plan.borrados.filter((r) => !excepto.has(r));
  const respetados = plan.modificados.map((m) => m.rel).concat(plan.borrados)
    .filter((r) => excepto.has(r));

  const base = {
    restaurados, recreados, respetados,
    intactos: plan.identicos, nuevos: plan.nuevos,
    entrada: plan.entrada
  };

  if (restaurados.length + recreados.length === 0) {
    return Object.assign(base, { snapshotSeguridad: null });
  }

  const snapshotSeguridad = snapshot.crear(raiz, {
    comando_disparador: 'restauracion de ' + id,
    herramienta: 'cli',
    severidad: 'seguridad',
    mensaje_contexto: 'Estado del proyecto justo antes de restaurar ' + id +
      ' — restaura esta snapshot si te arrepientes de la restauración.'
  }).entrada;

  for (const rel of restaurados.concat(recreados)) {
    const destino = path.join(raiz, rel);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(path.join(plan.carpeta, rel), destino);
  }

  return Object.assign(base, { snapshotSeguridad });
}

module.exports = { restaurar, planear };
