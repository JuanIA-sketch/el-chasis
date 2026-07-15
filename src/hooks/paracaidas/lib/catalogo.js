'use strict';
/**
 * Catálogo de metadatos de El Paracaídas.
 *
 * Cada proyecto tiene su carpeta dentro de una raíz GLOBAL fuera de cualquier
 * repo (~/.paracaidas, sobreescribible con PARACAIDAS_HOME). Ahí vive
 * snapshots.json: el índice que la Capa 1 usa para razonar cuál snapshot
 * restaurar. Guarda solo rutas, conteos y contexto — jamás contenido de
 * archivos ni valores de variables.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

/** Raíz global donde viven todas las snapshots de todos los proyectos. */
function raiz() {
  return process.env.PARACAIDAS_HOME || path.join(os.homedir(), '.paracaidas');
}

/** Slug legible: minúsculas, sin acentos, solo [a-z0-9-]. */
function slug(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'proyecto';
}

/**
 * Identidad estable del proyecto: slug del nombre + hash corto de la ruta
 * absoluta. Dos proyectos llamados igual en rutas distintas no chocan.
 */
function idProyecto(rutaProyecto) {
  const absoluta = path.resolve(rutaProyecto);
  const hash = crypto.createHash('sha256').update(absoluta).digest('hex').slice(0, 8);
  return slug(path.basename(absoluta)) + '-' + hash;
}

/** Carpeta del proyecto dentro de la raíz global. */
function dirProyecto(rutaProyecto) {
  return path.join(raiz(), idProyecto(rutaProyecto));
}

function rutaIndice(rutaProyecto) {
  return path.join(dirProyecto(rutaProyecto), 'snapshots.json');
}

/** Lee el índice. Índice ausente o corrupto → lista vacía (fail-open). */
function leer(rutaProyecto) {
  try {
    const entradas = JSON.parse(fs.readFileSync(rutaIndice(rutaProyecto), 'utf8'));
    return Array.isArray(entradas) ? entradas : [];
  } catch (_) {
    return [];
  }
}

/** Reescribe el índice completo (lo usa la política de retención). */
function guardar(rutaProyecto, entradas) {
  fs.mkdirSync(dirProyecto(rutaProyecto), { recursive: true });
  fs.writeFileSync(rutaIndice(rutaProyecto), JSON.stringify(entradas, null, 2));
}

/** Agrega una entrada al índice, completando id, timestamp y rutaProyecto. */
function agregar(rutaProyecto, datos) {
  const entrada = Object.assign({
    id: Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex'),
    timestamp: new Date().toISOString(),
    rutaProyecto: path.resolve(rutaProyecto)
  }, datos);

  const entradas = leer(rutaProyecto);
  entradas.push(entrada);
  fs.mkdirSync(dirProyecto(rutaProyecto), { recursive: true });
  fs.writeFileSync(rutaIndice(rutaProyecto), JSON.stringify(entradas, null, 2));
  return entrada;
}

module.exports = { raiz, idProyecto, dirProyecto, rutaIndice, leer, guardar, agregar };
