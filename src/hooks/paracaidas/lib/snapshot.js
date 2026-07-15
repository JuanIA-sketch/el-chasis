'use strict';
/**
 * Motor de snapshots — Capa 4 de El Paracaídas.
 *
 * Copia física de los archivos que valen la pena (según el perfil cacheado o
 * la heurística de emergencia) hacia ~/.paracaidas/<id>/snapshots/<snap-id>/,
 * y registra los metadatos en el catálogo para que la Capa 1 pueda razonar
 * después cuál snapshot restaurar.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const catalogo = require('./catalogo');
const perfil = require('./perfil');
const retencion = require('./retencion');

const MANIFIESTOS = [
  ['package.json', 'node'],
  ['requirements.txt', 'python'],
  ['pyproject.toml', 'python'],
  ['go.mod', 'go'],
  ['Cargo.toml', 'rust'],
  ['composer.json', 'php'],
  ['Gemfile', 'ruby']
];

function detectarTipo(rutaProyecto) {
  for (const [manifiesto, tipo] of MANIFIESTOS) {
    if (fs.existsSync(path.join(rutaProyecto, manifiesto))) return tipo;
  }
  return 'desconocido';
}

/** Recorre el proyecto y devuelve [{rel, bytes, mtime}] de lo copiable. */
function recolectar(raiz, reglas) {
  const encontrados = [];

  function caminar(dir, rel) {
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
      if (reglas.excluir.has(entrada.name)) continue;
      if (entrada.isSymbolicLink()) continue; // nunca seguir symlinks
      const relHijo = rel ? rel + '/' + entrada.name : entrada.name;
      const absHijo = path.join(dir, entrada.name);
      if (entrada.isDirectory()) {
        caminar(absHijo, relHijo);
      } else if (entrada.isFile()) {
        const stat = fs.statSync(absHijo);
        if (stat.size > reglas.umbralArchivoBytes) continue; // binario pesado
        encontrados.push({ rel: relHijo, bytes: stat.size, mtime: stat.mtimeMs });
      }
    }
  }

  caminar(raiz, '');
  return encontrados;
}

/**
 * Aplica el tope total: lo modificado recientemente entra primero,
 * lo que no cabe queda registrado como excluido.
 */
function aplicarTope(archivos, topeTotalBytes) {
  const porRecencia = archivos.slice().sort((a, b) => b.mtime - a.mtime);
  const incluidos = [];
  const excluidos = [];
  let acumulado = 0;
  for (const archivo of porRecencia) {
    if (acumulado + archivo.bytes <= topeTotalBytes) {
      incluidos.push(archivo);
      acumulado += archivo.bytes;
    } else {
      excluidos.push(archivo.rel);
    }
  }
  return { incluidos, excluidos, acumulado };
}

/**
 * Toma una snapshot del proyecto. `meta` viene del disparador (comando,
 * herramienta, severidad, mensaje de contexto). Devuelve { entrada, carpeta }.
 */
function crear(rutaProyecto, meta) {
  const raiz = path.resolve(rutaProyecto);
  const reglas = perfil.cargar(raiz);

  const candidatos = recolectar(raiz, reglas);
  const { incluidos, excluidos, acumulado } = aplicarTope(candidatos, reglas.topeTotalBytes);

  const id = Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
  const carpeta = path.join(catalogo.dirProyecto(raiz), 'snapshots', id);

  for (const archivo of incluidos) {
    const destino = path.join(carpeta, archivo.rel);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(path.join(raiz, archivo.rel), destino);
  }

  const entrada = catalogo.agregar(raiz, Object.assign({
    id,
    archivos: incluidos.map((a) => a.rel),
    totalBytes: acumulado,
    excluidos_por_tope: excluidos,
    tipoProyecto: detectarTipo(raiz),
    origenReglas: reglas.origen
  }, meta || {}));

  try {
    retencion.purgar(raiz);
  } catch (_) {
    // una purga fallida jamás debe impedir la snapshot ya tomada
  }

  return { entrada, carpeta };
}

module.exports = { crear, detectarTipo, recolectar };
