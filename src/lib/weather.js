// lib/weather.js
// Mesma lógica do script.js original (WMO_CODES, estimarOndas, calcularScoreSurf,
// grausParaDirecao, carregarClima) — a diferença é que carregarClima() agora
// RETORNA um objeto com os dados, em vez de escrever direto no DOM.
// Quem chama essa função decide o que fazer com o resultado (ex: guardar em um useState).

export const WMO_CODES = {
  0: '☀️|Céu limpo', 1: '🌤|Poucas nuvens', 2: '⛅|Parcialmente nublado', 3: '☁️|Nublado',
  45: '🌫|Névoa', 48: '🌫|Geada de névoa',
  51: '🌦|Chuvisco leve', 53: '🌦|Chuvisco mod.', 55: '🌧|Chuvisco denso',
  61: '🌧|Chuva leve', 63: '🌧|Chuva mod.', 65: '🌧|Chuva forte',
  80: '🌦|Pancadas leves', 81: '🌧|Pancadas mod.', 82: '⛈|Pancadas fortes',
  95: '⛈|Trovoada', 96: '⛈|Trovoada c/ granizo', 99: '⛈|Trovoada forte',
};

export function grausParaDirecao(graus) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const setas = ['↑', '↗', '↗', '↗', '→', '↘', '↘', '↘', '↓', '↙', '↙', '↙', '←', '↖', '↖', '↖'];
  const idx = Math.round((((graus % 360) + 360) % 360) / 22.5) % 16;
  return `${setas[idx]} ${dirs[idx]}`;
}

export function estimarOndas(ventoKmh) {
  const v = ventoKmh / 3.6;
  const g = 9.81;
  const H = 0.0248 * (v * v);
  const T = 0.4552 * Math.sqrt(H * g);
  return {
    alturaOnda: Math.min(parseFloat(H.toFixed(1)), 6),
    periodoOnda: Math.min(Math.round(T), 20),
  };
}

export function calcularScoreSurf({ alturaOnda, periodoOnda, ventoKmh, wmoCode }) {
  let score = 0;

  if (alturaOnda >= 0.8 && alturaOnda < 1.5) score += 3;
  else if (alturaOnda >= 1.5 && alturaOnda <= 2.5) score += 4;
  else if (alturaOnda >= 0.5 && alturaOnda < 0.8) score += 1;
  else if (alturaOnda > 2.5 && alturaOnda <= 3.5) score += 2;
  else if (alturaOnda > 3.5) score += 1;

  if (periodoOnda >= 14) score += 3;
  else if (periodoOnda >= 10) score += 2;
  else if (periodoOnda >= 7) score += 1;

  if (ventoKmh < 10) score += 2;
  else if (ventoKmh < 20) score += 1;
  else if (ventoKmh > 40) score -= 1;

  if ([65, 80, 81, 82, 95, 96, 99].includes(wmoCode)) score -= 1;

  score = Math.max(0, Math.min(10, score));

  const descs = [
    'Sem condições', 'Muito difícil', 'Ruim', 'Fraco', 'Razoável',
    'Ok p/ iniciantes', 'Bom', 'Muito bom', 'Excelente', 'Épico', 'Épico! 🤙',
  ];
  return { score, desc: descs[score] };
}

function fetchComTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

// Retorna { erro: true } ou o objeto completo pronto pra exibir no widget.
export async function carregarClima(lat, lon) {
  let atm;
  try {
    const urlAtm =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,` +
      `wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index` +
      `&wind_speed_unit=kmh&timezone=America%2FFortaleza`;

    const res = await fetchComTimeout(urlAtm, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    atm = await res.json();
  } catch (err) {
    console.error('[Clima] Falha na API atmosférica:', err.message);
    return { erro: true };
  }

  let ondas = null;
  try {
    const urlOnda =
      `https://marine-api.open-meteo.com/v1/marine?` +
      `latitude=${lat}&longitude=${lon}` +
      `&current=wave_height,wave_period,wave_direction,swell_wave_height` +
      `&timezone=America%2FFortaleza`;

    const res = await fetchComTimeout(urlOnda, 7000);
    if (res.ok) {
      const json = await res.json();
      if (json.current && json.current.wave_height != null) ondas = json.current;
    }
  } catch (err) {
    console.warn('[Clima] Marine API indisponível — usando estimativa.');
  }

  const c = atm.current;
  const wmoCode = c.weather_code ?? 0;
  const ventoKmh = c.wind_speed_10m ?? 0;
  const rajadaKmh = c.wind_gusts_10m ?? 0;
  const dirVento = c.wind_direction_10m ?? 0;
  const umidade = c.relative_humidity_2m ?? 0;
  const uvIndex = c.uv_index ?? 0;
  const temp = c.temperature_2m ?? 0;

  let alturaOnda, periodoOnda, dirOnda, swellH, estimado;
  if (ondas) {
    alturaOnda = ondas.wave_height ?? 0;
    periodoOnda = ondas.wave_period ?? 0;
    dirOnda = ondas.wave_direction ?? dirVento;
    swellH = ondas.swell_wave_height ?? alturaOnda;
    estimado = false;
  } else {
    const est = estimarOndas(ventoKmh);
    alturaOnda = est.alturaOnda;
    periodoOnda = est.periodoOnda;
    dirOnda = dirVento;
    swellH = alturaOnda;
    estimado = true;
  }

  const { score, desc: scoreDesc } = calcularScoreSurf({ alturaOnda, periodoOnda, ventoKmh, wmoCode });
  const wmoInfo = WMO_CODES[wmoCode] ?? '🌡|--';
  const [emoji, descClima] = wmoInfo.split('|');
  const uvLabels = ['Mínimo', 'Baixo', 'Moderado', 'Alto', 'Muito alto', 'Extremo'];
  const uvLabel = uvLabels[Math.min(Math.floor(uvIndex / 3), 5)];
  const hora = new Date(c.time ?? Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return {
    erro: false,
    emoji,
    descClima,
    temp: Math.round(temp),
    hora,
    ventoKmh: Math.round(ventoKmh),
    dirVentoTexto: grausParaDirecao(dirVento),
    rajadaKmh: Math.round(rajadaKmh),
    alturaOnda,
    periodoOnda,
    estimado,
    swellH,
    umidade,
    uvIndex,
    uvLabel,
    score,
    scoreDesc,
    scoreColor: score >= 7 ? '#2dd4bf' : score >= 5 ? '#f59e0b' : '#ef4444',
  };
}
