'use strict';
/**
 * Catálogo de patrones peligrosos, compartido entre el hook (¿este comando
 * amerita snapshot?) y el post-mortem (¿por qué fue peligroso? — Capa 3).
 *
 * Origen del catálogo: PARACAIDAS_CATALOGO (el del Freno de Mano) si está
 * definido y legible; si no, la copia propia hooks/paracaidas.config.json.
 */

const fs = require('fs');
const path = require('path');

function cargarCatalogo() {
  const externo = process.env.PARACAIDAS_CATALOGO;
  if (externo) {
    try {
      return JSON.parse(fs.readFileSync(externo, 'utf8'));
    } catch (_) {
      // el catálogo del Freno no está donde se esperaba → copia propia
    }
  }
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'hooks', 'paracaidas.config.json'), 'utf8')
  );
}

function buscarMatch(lista, texto) {
  for (const entrada of lista || []) {
    try {
      const regex = new RegExp(entrada.patron, entrada.sensibleMayusculas ? '' : 'i');
      if (regex.test(texto)) return entrada;
    } catch (_) {
      // un patrón inválido no debe tumbar al que consulta
    }
  }
  return null;
}

/** ¿Por qué es peligroso este comando? null si el catálogo no lo conoce. */
function explicar(comando) {
  const catalogo = cargarCatalogo();
  const critico = buscarMatch(catalogo.critico, comando);
  if (critico) return { severidad: 'critico', razon: critico.razon };
  const alto = buscarMatch(catalogo.alto, comando);
  if (alto) return { severidad: 'alto', razon: alto.razon };
  return null;
}

module.exports = { cargarCatalogo, buscarMatch, explicar };
