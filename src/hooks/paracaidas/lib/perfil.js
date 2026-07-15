'use strict';
/**
 * Perfil de snapshot — la mitad "inteligente" de la Capa 4.
 *
 * Fable 5 razona una sola vez por proyecto qué vale la pena copiar y lo cachea
 * en ~/.paracaidas/<id>/perfil.json. El hook (que corre síncrono antes de cada
 * comando peligroso) solo LEE ese perfil: rápido y sin depender de la red.
 *
 * Si el perfil no existe todavía o está roto, aplica la heurística de
 * EMERGENCIA — el paracaídas de reserva: exclusiones universales y umbrales
 * conservadores. Nunca se queda sin snapshot por falta de perfil.
 */

const fs = require('fs');
const path = require('path');
const catalogo = require('./catalogo');

/** Exclusiones que aplican SIEMPRE, diga lo que diga el perfil. */
const EXCLUSIONES_DURAS = ['.git', '.paracaidas'];

/** Heurística de emergencia: primera snapshot de un proyecto sin perfil. */
const EMERGENCIA = {
  excluir: [
    'node_modules', 'venv', '.venv', '__pycache__',
    'dist', 'build', 'out', '.next', 'target', 'vendor',
    'coverage', '.cache', 'tmp'
  ],
  umbralArchivoMB: 10,
  topeTotalMB: 200
};

function esValido(datos) {
  return datos && typeof datos === 'object' &&
    Array.isArray(datos.excluir) &&
    typeof datos.umbralArchivoMB === 'number' && datos.umbralArchivoMB > 0 &&
    typeof datos.topeTotalMB === 'number' && datos.topeTotalMB > 0;
}

function normalizar(origen, datos) {
  return {
    origen,
    tipoProyecto: datos.tipoProyecto,
    excluir: new Set(datos.excluir.concat(EXCLUSIONES_DURAS)),
    umbralArchivoBytes: datos.umbralArchivoMB * 1024 * 1024,
    topeTotalBytes: datos.topeTotalMB * 1024 * 1024
  };
}

function rutaPerfil(rutaProyecto) {
  return path.join(catalogo.dirProyecto(rutaProyecto), 'perfil.json');
}

/** Carga el perfil cacheado; ausente o inválido → emergencia (fail-open). */
function cargar(rutaProyecto) {
  try {
    const datos = JSON.parse(fs.readFileSync(rutaPerfil(rutaProyecto), 'utf8'));
    if (esValido(datos)) return normalizar('perfil', datos);
  } catch (_) {
    // sin perfil o perfil roto → emergencia
  }
  return normalizar('emergencia', EMERGENCIA);
}

module.exports = { cargar, rutaPerfil, EMERGENCIA, EXCLUSIONES_DURAS };
