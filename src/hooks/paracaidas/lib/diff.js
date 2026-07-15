'use strict';
/**
 * Motor de diff de El Paracaídas — Capa 2.
 *
 * Compara una snapshot contra el estado ACTUAL del proyecto y clasifica cada
 * archivo en cuatro categorías. La restauración quirúrgica solo toca
 * `modificados` y `borrados`; `identicos` y `nuevos` (trabajo hecho después
 * de la snapshot) quedan intactos. Compara CONTENIDO real (bytes), no fechas:
 * un archivo re-guardado idéntico no se restaura.
 */

const fs = require('fs');
const path = require('path');
const catalogo = require('./catalogo');
const perfil = require('./perfil');
const snapshot = require('./snapshot');

function contenidoIgual(rutaA, rutaB) {
  if (fs.statSync(rutaA).size !== fs.statSync(rutaB).size) return false;
  return fs.readFileSync(rutaA).equals(fs.readFileSync(rutaB));
}

/** Clasifica la snapshot `id` contra el estado actual de `rutaProyecto`. */
function calcular(rutaProyecto, id) {
  const raiz = path.resolve(rutaProyecto);
  const entrada = catalogo.leer(raiz).find((e) => e.id === id);
  const carpeta = path.join(catalogo.dirProyecto(raiz), 'snapshots', id);

  if (!entrada || !fs.existsSync(carpeta)) {
    throw new Error(
      'La snapshot "' + id + '" no existe para este proyecto. ' +
      'Corre "listar" para ver las snapshots disponibles.'
    );
  }

  const modificados = [];
  const borrados = [];
  const identicos = [];

  for (const rel of entrada.archivos) {
    const actual = path.join(raiz, rel);
    if (!fs.existsSync(actual)) {
      borrados.push(rel);
    } else if (contenidoIgual(actual, path.join(carpeta, rel))) {
      identicos.push(rel);
    } else {
      modificados.push({ rel, mtimeMs: fs.statSync(actual).mtimeMs });
    }
  }

  const enSnapshot = new Set(entrada.archivos);
  const nuevos = snapshot.recolectar(raiz, perfil.cargar(raiz))
    .map((a) => a.rel)
    .filter((rel) => !enSnapshot.has(rel));

  return { entrada, carpeta, modificados, borrados, identicos, nuevos };
}

module.exports = { calcular };
