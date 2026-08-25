// lib/weather.js

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

export function calcularScoreSurf({
  alturaOnda,
  periodoOnda,
  ventoKmh,
  wmoCode,
  direcaoVento = 0,
  direcaoOnda = 0,
}) {
  /*
   * SCORE DE SURF
   *
   * 10 pontos possíveis:
   * - Tamanho da onda: 0–3
   * - Período:         0–3
   * - Vento:           0–2
   * - Tempo:           0–1
   * - Regularidade:    0–1
   */

  let score = 0;

  // ============================================================
  // 1. ALTURA DA ONDA
  // ============================================================

  if (alturaOnda >= 0.7 && alturaOnda < 1.0) {
    score += 1.8;
  } else if (alturaOnda >= 1.0 && alturaOnda < 1.3) {
    score += 2.4;
  } else if (alturaOnda >= 1.3 && alturaOnda < 1.8) {
    score += 3.0;
  } else if (alturaOnda >= 1.8 && alturaOnda < 2.3) {
    score += 2.7;
  } else if (alturaOnda >= 2.3 && alturaOnda < 3.0) {
    score += 2.1;
  } else if (alturaOnda >= 3.0 && alturaOnda < 3.8) {
    score += 1.3;
  } else if (alturaOnda >= 3.8) {
    score += 0.7;
  } else if (alturaOnda >= 0.4) {
    score += 0.8;
  }

  // ============================================================
  // 2. PERÍODO
  // ============================================================

  if (periodoOnda >= 16) {
    score += 3.0;
  } else if (periodoOnda >= 14) {
    score += 2.7;
  } else if (periodoOnda >= 12) {
    score += 2.3;
  } else if (periodoOnda >= 10) {
    score += 1.9;
  } else if (periodoOnda >= 8) {
    score += 1.3;
  } else if (periodoOnda >= 6) {
    score += 0.7;
  } else {
    score += 0.2;
  }

  // ============================================================
  // 3. VENTO
  // ============================================================

  if (ventoKmh < 5) {
    score += 2.0;
  } else if (ventoKmh < 10) {
    score += 1.8;
  } else if (ventoKmh < 15) {
    score += 1.5;
  } else if (ventoKmh < 20) {
    score += 1.1;
  } else if (ventoKmh < 25) {
    score += 0.7;
  } else if (ventoKmh < 30) {
    score += 0.3;
  } else if (ventoKmh < 40) {
    score -= 0.3;
  } else {
    score -= 0.8;
  }

  // ============================================================
  // 4. CONDIÇÕES CLIMÁTICAS
  // ============================================================

  if ([0, 1, 2, 3].includes(wmoCode)) {
    score += 1;
  }

  if ([51, 53, 61, 63, 80, 81].includes(wmoCode)) {
    score -= 0.3;
  }

  if ([65, 82, 95, 96, 99].includes(wmoCode)) {
    score -= 0.9;
  }

  // ============================================================
  // NORMALIZAÇÃO
  // ============================================================

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;

  let desc;

  if (score < 2) {
    desc = 'Sem condições';
  } else if (score < 3.5) {
    desc = 'Muito fraco';
  } else if (score < 4.5) {
    desc = 'Fraco';
  } else if (score < 5.5) {
    desc = 'Razoável';
  } else if (score < 6.5) {
    desc = 'Bom para iniciantes';
  } else if (score < 7.5) {
    desc = 'Bom';
  } else if (score < 8.5) {
    desc = 'Muito bom';
  } else if (score < 9.3) {
    desc = 'Excelente';
  } else {
    desc = 'Épico 🤙';
  }

  return {
    score,
    desc,
  };
}

function descricaoGenerica(score) {
  if (score < 2) return 'Sem condições';
  if (score < 4) return 'Fraco';
  if (score < 5.5) return 'Razoável';
  if (score < 7) return 'Bom';
  if (score < 8.5) return 'Muito bom';
  if (score < 9.5) return 'Excelente';
  return 'Épico 🤙';
}

export function calcularScoreKitesurf({ ventoKmh, alturaOnda, wmoCode }) {
  let score = 0;

  if (ventoKmh < 12) score += 0.5;
  else if (ventoKmh < 16) score += 1.8;
  else if (ventoKmh < 20) score += 3.2;
  else if (ventoKmh < 25) score += 5.0;
  else if (ventoKmh < 35) score += 6.0;
  else if (ventoKmh < 45) score += 4.5;
  else if (ventoKmh < 55) score += 2.0;
  else score += 0.3;

  if (alturaOnda < 0.3) score += 1.2;
  else if (alturaOnda < 1.2) score += 2.0;
  else if (alturaOnda < 2.0) score += 1.3;
  else score += 0.4;

  if ([0, 1, 2, 3].includes(wmoCode)) score += 2;
  else if ([45, 48, 51, 53, 61, 63, 80, 81].includes(wmoCode)) score += 1;
  else score -= 3;

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  return { score, desc: descricaoGenerica(score) };
}

export function calcularScoreWindsurf({ ventoKmh, alturaOnda, wmoCode }) {
  let score = 0;

  if (ventoKmh < 10) score += 0.5;
  else if (ventoKmh < 14) score += 1.6;
  else if (ventoKmh < 18) score += 2.8;
  else if (ventoKmh < 24) score += 4.2;
  else if (ventoKmh < 34) score += 5.0;
  else if (ventoKmh < 42) score += 3.2;
  else if (ventoKmh < 50) score += 1.4;
  else score += 0.3;

  if (alturaOnda < 0.3) score += 1.5;
  else if (alturaOnda < 1.5) score += 3.0;
  else if (alturaOnda < 2.5) score += 2.2;
  else score += 1.0;

  if ([0, 1, 2, 3].includes(wmoCode)) score += 2;
  else if ([45, 48, 51, 53, 61, 63, 80, 81].includes(wmoCode)) score += 1;
  else score -= 3;

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  return { score, desc: descricaoGenerica(score) };
}

export function calcularScoreSUP({ ventoKmh, alturaOnda, wmoCode }) {
  let score = 0;

  if (ventoKmh < 8) score += 6.0;
  else if (ventoKmh < 14) score += 4.5;
  else if (ventoKmh < 20) score += 2.5;
  else if (ventoKmh < 28) score += 1.0;
  else score += 0.2;

  if (alturaOnda < 0.4) score += 2.0;
  else if (alturaOnda < 0.8) score += 1.4;
  else if (alturaOnda < 1.3) score += 0.6;
  else score += 0.1;

  if ([0, 1, 2, 3].includes(wmoCode)) score += 2;
  else if ([45, 48, 51, 53, 61, 63, 80, 81].includes(wmoCode)) score += 1;
  else score -= 2;

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  return { score, desc: descricaoGenerica(score) };
}

export const MODALIDADES = {
  surf: { label: 'Surf', emoji: '🏄', calcular: calcularScoreSurf },
  kitesurf: { label: 'Kitesurf', emoji: '🪁', calcular: calcularScoreKitesurf },
  windsurf: { label: 'Windsurf', emoji: '⛵', calcular: calcularScoreWindsurf },
  sup: { label: 'Stand Up Paddle', emoji: '🧘', calcular: calcularScoreSUP },
};

export function calcularScore(modalidade, dados) {
  const config = MODALIDADES[modalidade] ?? MODALIDADES.surf;
  return config.calcular(dados);
}

function fetchComTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

// "2026-08-17T14:00" -> "14:00" (a string já vem no fuso local, então
// evitamos passar por `new Date()` pra não correr risco de reconverter fuso)
function horaDeIso(iso) {
  return iso.split('T')[1]?.slice(0, 5) ?? '--:--';
}

function horaIndexDeIso(iso) {
  return parseInt(iso.split('T')[1]?.slice(0, 2) ?? '0', 10);
}

export function calcularMelhorPeriodo(horas) {
  if (!horas.length) return null;

  const ordenadas = [...horas]
    .sort((a, b) => a.horaIdx - b.horaIdx);

  /*
   * A janela de surf deve ter entre 3 e 4 horas.
   * Nunca mostramos apenas 1 ou 2 horas.
   */

  const janelas = [];

  for (let inicio = 0; inicio < ordenadas.length; inicio++) {

    for (let duracao = 3; duracao <= 4; duracao++) {

      const fim = inicio + duracao - 1;

      if (fim >= ordenadas.length) {
        continue;
      }

      const janela = ordenadas.slice(inicio, fim + 1);

      // Precisa ser uma sequência horária contínua
      let continua = true;

      for (let i = 1; i < janela.length; i++) {
        if (
          janela[i].horaIdx !==
          janela[i - 1].horaIdx + 1
        ) {
          continua = false;
          break;
        }
      }

      if (!continua) continue;

      const scores = janela.map(h => h.score);

      const media =
        scores.reduce((a, b) => a + b, 0) /
        scores.length;

      const pico = Math.max(...scores);
      const minimo = Math.min(...scores);

      /*
       * Penaliza janelas que tenham uma queda muito grande.
       */
      const consistencia =
        minimo >= pico - 1.5
          ? 1
          : minimo >= pico - 2.5
            ? 0.5
            : 0;

      /*
       * A média é o fator mais importante.
       * O pico ajuda a desempatar.
       * A consistência evita janelas ruins.
       */
      const valor =
        media * 0.65 +
        pico * 0.25 +
        consistencia * 0.10;

      janelas.push({
        janela,
        media,
        pico,
        valor,
      });
    }
  }

  if (!janelas.length) return null;

  /*
   * Melhor janela.
   *
   * Em empate:
   * - prefere 4 horas
   * - depois prefere maior média
   */
  janelas.sort((a, b) => {

    if (Math.abs(b.valor - a.valor) < 0.15) {
      if (
        b.janela.length !==
        a.janela.length
      ) {
        return (
          b.janela.length -
          a.janela.length
        );
      }
    }

    return b.valor - a.valor;
  });

  const escolhida = janelas[0].janela;

  const melhor = escolhida.reduce(
    (a, b) =>
      b.score > a.score ? b : a
  );

  return {
    inicio:
      `${String(escolhida[0].horaIdx)
        .padStart(2, '0')}:00`,

    fim:
      `${String(escolhida[escolhida.length - 1].horaIdx + 1)
        .padStart(2, '0')}:00`,

    score:
      Math.round(melhor.score * 10) / 10,

    desc: melhor.desc,
  };
}

function encontrarIndicePorHora(times, hora) {
  if (!Array.isArray(times)) return -1;

  return times.findIndex(t => t === hora);
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
      `&hourly=weather_code,wind_speed_10m` +
      `&forecast_days=1` +
      `&wind_speed_unit=kmh&timezone=America%2FFortaleza`;

    const res = await fetchComTimeout(urlAtm, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    atm = await res.json();
  } catch (err) {
    console.error('[Clima] Falha na API atmosférica:', err.message);
    return { erro: true };
  }

  let ondasAtual = null;
  let ondasHorario = null;
  try {
    const urlOnda =
      `https://marine-api.open-meteo.com/v1/marine?` +
      `latitude=${lat}&longitude=${lon}` +
      `&current=wave_height,wave_period,wave_direction,swell_wave_height` +
      `&hourly=wave_height,wave_period,sea_level_height_msl` +
      `&forecast_days=1&models=best_match` +
      `&timezone=America%2FFortaleza`;

    const res = await fetchComTimeout(urlOnda, 7000);
    if (res.ok) {
      const json = await res.json();
      if (json.current && json.current.wave_height != null) ondasAtual = json.current;
      if (json.hourly && Array.isArray(json.hourly.time)) ondasHorario = json.hourly;
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
  if (ondasAtual) {
    alturaOnda = ondasAtual.wave_height ?? 0;
    periodoOnda = ondasAtual.wave_period ?? 0;
    dirOnda = ondasAtual.wave_direction ?? dirVento;
    swellH = ondasAtual.swell_wave_height ?? alturaOnda;
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

  // ---- Maré do dia (sea_level_height_msl) ----
  let mare = [];
  let mareAlta = null;
  let mareBaixa = null;
  let mareEstimada = true;

  if (ondasHorario && Array.isArray(ondasHorario.sea_level_height_msl)) {
    mare = ondasHorario.time.map((t, i) => ({
      hora: horaDeIso(t),
      horaIdx: horaIndexDeIso(t),
      altura: ondasHorario.sea_level_height_msl[i],
    })).filter(p => p.altura != null);

    if (mare.length) {
      mareEstimada = false;
      mareAlta = mare.reduce((a, b) => (b.altura > a.altura ? b : a));
      mareBaixa = mare.reduce((a, b) => (b.altura < a.altura ? b : a));
    }
  }

  let horasBrutas = [];
  if (atm.hourly && Array.isArray(atm.hourly.time)) {
    horasBrutas = atm.hourly.time.map((t, i) => {
      const horaIdx = horaIndexDeIso(t);
      const wmoH = atm.hourly.weather_code?.[i] ?? wmoCode;
      const ventoH = atm.hourly.wind_speed_10m?.[i] ?? ventoKmh;

      let altH, perH;
      const indiceOnda = encontrarIndicePorHora(ondasHorario?.time, t);

      if (indiceOnda >= 0 && ondasHorario?.wave_height?.[indiceOnda] != null) {
        altH = ondasHorario.wave_height[indiceOnda];
        perH = ondasHorario.wave_period?.[indiceOnda] ?? periodoOnda;
      } else {
        const est = estimarOndas(ventoH);
        altH = est.alturaOnda;
        perH = est.periodoOnda;
      }

      return { horaIdx, alturaOnda: altH, periodoOnda: perH, ventoKmh: ventoH, wmoCode: wmoH };
    }).filter(h => h.horaIdx >= 5 && h.horaIdx <= 19);
  }

  const melhorPeriodo = horasBrutas.length
    ? calcularMelhorPeriodo(horasBrutas.map((h) => ({ horaIdx: h.horaIdx, ...calcularScoreSurf(h) })))
    : null;

  return {
    erro: false,
    emoji,
    descClima,
    temp: Math.round(temp),
    hora,
    ventoKmh: Math.round(ventoKmh),
    wmoCode,
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
    mare,
    mareAlta,
    mareBaixa,
    mareEstimada,
    melhorPeriodo,
    horasBrutas,
  };
}