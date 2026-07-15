'use strict';
/**
 * Diagnóstico post-mortem — Capa 3 de El Paracaídas.
 *
 * Después de cualquier restauración explica, en español simple y tono
 * pedagógico (el mismo del Freno de Mano), qué comando causó el desastre,
 * cuándo, por qué era peligroso y qué archivos se vieron afectados — todo a
 * partir de los metadatos que el catálogo ya guarda. Rutas y conteos, jamás
 * contenidos.
 */

const patrones = require('./patrones');

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaLegible(iso) {
  const f = new Date(iso);
  if (isNaN(f.getTime())) return iso;
  const hh = String(f.getHours()).padStart(2, '0');
  const mm = String(f.getMinutes()).padStart(2, '0');
  return 'el ' + f.getDate() + ' de ' + MESES[f.getMonth()] + ' de ' +
    f.getFullYear() + ' a las ' + hh + ':' + mm;
}

function listar(rutas) {
  return rutas.join(', ');
}

/** Párrafo 1: qué pasó y cuándo, según la severidad de la snapshot. */
function queOcurrio(entrada) {
  const cuando = fechaLegible(entrada.timestamp);
  const comando = entrada.comando_disparador || 'un comando desconocido';

  if (entrada.severidad === 'manual') {
    return 'Esta snapshot la pediste tú manualmente ' + cuando +
      (entrada.mensaje_contexto ? ' ("' + entrada.mensaje_contexto + '")' : '') +
      '. Acabas de volver a ese punto que tú mismo marcaste como seguro.';
  }
  if (entrada.severidad === 'seguridad') {
    return 'Esta snapshot se guardó automáticamente ' + cuando + ', justo antes de una ' +
      'restauración anterior ("' + comando + '"). Al restaurarla, deshiciste esa ' +
      'restauración: volviste al estado previo, por si te habías arrepentido.';
  }

  const explicacion = patrones.explicar(comando);
  const porQue = explicacion
    ? 'Ese comando es peligroso porque: ' + explicacion.razon
    : 'El catálogo lo tenía marcado como riesgoso (severidad ' +
      (entrada.severidad || 'desconocida') + '), por eso se guardó la copia.';

  return cuando.charAt(0).toUpperCase() + cuando.slice(1) + ', el comando "' + comando +
    '" (vía ' + (entrada.herramienta || 'terminal') + ') estaba por ejecutarse y ' +
    'El Paracaídas guardó esta snapshot justo antes. ' + porQue;
}

/** Párrafo 2: qué archivos se vieron afectados y qué quedó intacto. */
function queSeAfecto(resultado) {
  const partes = [];
  if (resultado.restaurados.length > 0) {
    partes.push(resultado.restaurados.length + ' con el contenido dañado, sobrescritos con la versión sana (' +
      listar(resultado.restaurados) + ')');
  }
  if (resultado.recreados.length > 0) {
    partes.push(resultado.recreados.length + ' que habían desaparecido, recreados (' +
      listar(resultado.recreados) + ')');
  }
  let texto = partes.length > 0
    ? 'La restauración te devolvió ' + (resultado.restaurados.length + resultado.recreados.length) +
      ' archivos: ' + partes.join('; ') + '.'
    : 'No hubo que tocar ningún archivo.';

  if (resultado.intactos.length > 0) {
    texto += ' Otros ' + resultado.intactos.length + ' estaban idénticos a la snapshot y no se tocaron.';
  }
  if (resultado.nuevos.length > 0) {
    texto += ' Tu trabajo posterior quedó a salvo: ' + resultado.nuevos.length +
      ' archivo(s) creados después de la snapshot siguen intactos (' + listar(resultado.nuevos) + ').';
  }
  if (resultado.respetados.length > 0) {
    texto += ' Y ' + resultado.respetados.length + ' archivo(s) que pediste proteger con --excepto no se tocaron (' +
      listar(resultado.respetados) + ').';
  }
  return texto;
}

/** Cierre pedagógico. */
function cierre(entrada, resultado) {
  let texto = '';
  if (entrada.severidad === 'critico' || entrada.severidad === 'alto') {
    texto = 'Para la próxima: cuando El Freno de Mano te advierta sobre un comando así, ' +
      'tómate un segundo antes de confirmar — esta vez el Paracaídas te cubrió.';
  }
  if (resultado.snapshotSeguridad) {
    texto += (texto ? ' ' : '') + 'Y tranquilo: el estado de hace un momento quedó guardado en la snapshot de seguridad ' +
      resultado.snapshotSeguridad.id + ', por si quieres deshacer esta restauración.';
  }
  return texto;
}

/** Genera el diagnóstico completo en español simple. */
function generar(entrada, resultado) {
  return [
    '📋 Diagnóstico post-mortem',
    queOcurrio(entrada),
    queSeAfecto(resultado),
    cierre(entrada, resultado)
  ].filter(Boolean).join('\n');
}

module.exports = { generar };
