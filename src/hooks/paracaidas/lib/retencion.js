'use strict';
/**
 * Política de retención de El Paracaídas.
 *
 * Las snapshots automáticas (severidad critico/alto, las que dispara el hook)
 * se acumulan solas comando tras comando; sin límite, ~/.paracaidas crecería
 * para siempre. Regla: se conservan las 20 automáticas MÁS RECIENTES por
 * proyecto; al crear una nueva, la más vieja se purga (índice y carpeta).
 *
 * Las snapshots manuales y de seguridad JAMÁS se purgan: las manuales las
 * pidió el usuario a conciencia, y las de seguridad son la única forma de
 * deshacer una restauración.
 */

const fs = require('fs');
const path = require('path');
const catalogo = require('./catalogo');

const LIMITE_AUTOMATICAS = 20;

function esAutomatica(entrada) {
  return entrada.severidad === 'critico' || entrada.severidad === 'alto';
}

/** Qué se purgaría: las automáticas más viejas que las `conservar` recientes. */
function plan(rutaProyecto, opciones) {
  const conservar = (opciones && typeof opciones.conservar === 'number')
    ? opciones.conservar
    : LIMITE_AUTOMATICAS;
  const entradas = catalogo.leer(rutaProyecto);
  const automaticas = entradas.filter(esAutomatica);
  const purgables = automaticas.slice(0, Math.max(0, automaticas.length - conservar));
  return {
    purgables,
    conservadas: automaticas.length - purgables.length,
    protegidas: entradas.length - automaticas.length
  };
}

/** Ejecuta la purga: borra carpetas físicas y reescribe el índice. */
function purgar(rutaProyecto, opciones) {
  const { purgables, conservadas, protegidas } = plan(rutaProyecto, opciones);
  if (purgables.length === 0) {
    return { purgadas: [], conservadas, protegidas };
  }

  const ids = new Set(purgables.map((e) => e.id));
  for (const id of ids) {
    fs.rmSync(path.join(catalogo.dirProyecto(rutaProyecto), 'snapshots', id),
      { recursive: true, force: true });
  }
  catalogo.guardar(rutaProyecto,
    catalogo.leer(rutaProyecto).filter((e) => !ids.has(e.id)));

  return { purgadas: purgables.map((e) => e.id), conservadas, protegidas };
}

module.exports = { plan, purgar, LIMITE_AUTOMATICAS };
