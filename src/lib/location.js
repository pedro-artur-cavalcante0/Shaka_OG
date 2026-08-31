// lib/location.js
// Cálculo de distância entre coordenadas e acesso à geolocalização do navegador.

export const RAIO_PADRAO_KM = 30;

// Fórmula de Haversine — distância em linha reta (km) entre duas coordenadas
// geográficas, considerando a curvatura da Terra.
export function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // raio médio da Terra, em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Promise que resolve com { latitude, longitude } do usuário, ou rejeita se
// o navegador não suportar geolocalização, o usuário negar a permissão, ou
// a busca demorar demais.
export function obterLocalizacaoUsuario(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation-indisponivel'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
}