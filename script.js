/* =============================================
   SHAKA — script.js
   ============================================= */

const SUPABASE_URL      = 'https://lrzofimngusbcwlqbsts.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyem9maW1uZ3VzYmN3bHFic3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Nzk4NjgsImV4cCI6MjA5MzA1NTg2OH0.SF21e1Sx_bueRV48exU08NGG2raNahY68nngPtWWLKU';

// ── Estado global ──────────────────────────────────────────────
let map, markersLayer;
let praias           = [];
let todosServicos    = [];   // cache para filtro client-side
let praiaSelecionada = null;
let usuarioAtual     = null;
let usuarioId        = null;
let usuarioNome      = null;
let modoAutenticacao = 'login';

// ── Refs DOM ───────────────────────────────────────────────────
let listaElement, filtroInput, painelDetalhes, praiaNome, praiaTipo,
    praiaDados, praiaPerigos, analisePraia, eventosDiv,
    comentariosDiv, comentarioInput, btnEnviar,
    resumoIADiv, btnGerarResumoIA;

// ═════════════════════════════════════════════
//   INIT
// ═════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => { iniciarApp(); });

async function iniciarApp() {
    listaElement    = document.getElementById('listaPraias');
    filtroInput     = document.getElementById('filtroPraia');
    painelDetalhes  = document.getElementById('painelDetalhes');
    praiaNome       = document.getElementById('praiaNome');
    praiaTipo       = document.getElementById('praiaTipo');
    praiaDados      = document.getElementById('praiaDados');
    praiaPerigos    = document.getElementById('praiaPerigos');
    analisePraia    = document.getElementById('analisePraia');
    eventosDiv      = document.getElementById('eventos');
    comentariosDiv  = document.getElementById('comentarios');
    comentarioInput = document.getElementById('comentario');
    btnEnviar       = document.getElementById('btnEnviar');
    resumoIADiv     = document.getElementById('resumoIA');
    btnGerarResumoIA = document.getElementById('btnGerarResumoIA');
    if (btnGerarResumoIA) {
        btnGerarResumoIA.addEventListener('click', gerarResumoIA);
    }

    configurarMapa();
    verificarUsuarioLogado();
    btnEnviar.addEventListener('click', enviarComentario);
    filtroInput.addEventListener('input', filtrarPraias);

    await Promise.all([
        carregarPraias(),
        carregarServicos()
    ]);
}

// ═════════════════════════════════════════════
//   SUPABASE
// ═════════════════════════════════════════════
async function fazerRequisicaoSupabase(tabela, filtros = '', metodo = 'GET', corpo = null) {
    let url = `${SUPABASE_URL}/rest/v1/${tabela}`;
    if (filtros) url += `?${filtros}`;

    const headers = {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        metodo === 'POST' ? 'return=representation' : ''
    };

    const opcoes = { method: metodo, headers };
    if (corpo) opcoes.body = JSON.stringify(corpo);

    try {
        const response = await fetch(url, opcoes);
        if (!response.ok) {
            const msg = await response.text();
            console.error(`Erro ${response.status} em [${metodo}] ${tabela}:`, msg);
            return null;
        }
        if (metodo === 'POST') return true;
        return await response.json();
    } catch (err) {
        console.error(`Erro ao acessar ${tabela}:`, err);
        return null;
    }
}

// ═════════════════════════════════════════════
//   AUTH
// ═════════════════════════════════════════════
function verificarUsuarioLogado() {
    const salvo = localStorage.getItem('shakaUsuario');
    if (salvo) {
        const dados = JSON.parse(salvo);
        usuarioAtual = dados;
        usuarioId    = dados.id;
        usuarioNome  = dados.nome;
        atualizarNavbar();
    } else {
        usuarioId = crypto.randomUUID();
        localStorage.setItem('shakaUserId', usuarioId);
    }
}

function atualizarNavbar() {
    const btnLogin = document.getElementById('btnLogin');
    if (!usuarioAtual) return;

    const inicial = usuarioNome.charAt(0).toUpperCase();
    btnLogin.innerHTML = `
        <div class="usuario-info">
            <span>${usuarioNome}</span>
            <div class="usuario-avatar">${inicial}</div>
        </div>`;
    btnLogin.onclick = null;
    btnLogin.style.background = 'transparent';
    btnLogin.style.color = '#cbd5e1';
    const avatar = btnLogin.querySelector('.usuario-avatar');
    if (avatar) { avatar.onclick = () => logout(); }
}

function abrirModalLogin() {
    document.getElementById('modalAutenticacao').classList.add('active');
    modoAutenticacao = 'login';
    document.getElementById('modalTitulo').textContent     = 'Login';
    document.getElementById('grupoEmail').style.display    = 'none';
    document.getElementById('btnSubmit').textContent       = 'Login';
    document.getElementById('btnAlternarModo').textContent = 'Não tem conta? Cadastre-se';
}

function fecharModal() {
    document.getElementById('modalAutenticacao').classList.remove('active');
    document.getElementById('formAutenticacao').reset();
}

function alternarModo() {
    if (modoAutenticacao === 'login') {
        modoAutenticacao = 'cadastro';
        document.getElementById('modalTitulo').textContent     = 'Cadastro';
        document.getElementById('grupoEmail').style.display    = 'block';
        document.getElementById('btnSubmit').textContent       = 'Cadastrar';
        document.getElementById('btnAlternarModo').textContent = 'Já tem conta? Login';
    } else {
        modoAutenticacao = 'login';
        document.getElementById('modalTitulo').textContent     = 'Login';
        document.getElementById('grupoEmail').style.display    = 'none';
        document.getElementById('btnSubmit').textContent       = 'Login';
        document.getElementById('btnAlternarModo').textContent = 'Não tem conta? Cadastre-se';
    }
}

async function autenticar(event) {
    event.preventDefault();
    const nome  = document.getElementById('inputNome').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const senha = document.getElementById('inputSenha').value.trim();

    if (!nome || !senha) { mostrarToast('Preencha todos os campos!', 'erro'); return; }

    if (modoAutenticacao === 'cadastro') {
        if (!email) { mostrarToast('Email é obrigatório para cadastro!', 'erro'); return; }
        const novoUser = { id: crypto.randomUUID(), nome, email, senha };
        let ok = await fazerRequisicaoSupabase('usuario', '', 'POST', novoUser);
        if (!ok) ok = await fazerRequisicaoSupabase('Usuario', '', 'POST', novoUser);
        if (ok) {
            usuarioAtual = novoUser; usuarioId = novoUser.id; usuarioNome = nome;
            localStorage.setItem('shakaUsuario', JSON.stringify(novoUser));
            atualizarNavbar(); fecharModal();
            mostrarToast(`Bem-vindo, ${nome}! 🌊`, 'ok');
        } else { mostrarToast('Erro ao cadastrar. Tente novamente!', 'erro'); }
    } else {
        let usuarios = await fazerRequisicaoSupabase('usuario', `nome=eq.${encodeURIComponent(nome)}`);
        if (!usuarios) usuarios = await fazerRequisicaoSupabase('Usuario', `nome=eq.${encodeURIComponent(nome)}`);
        if (usuarios && usuarios.length > 0) {
            const user = usuarios[0];
            if (user.senha === senha) {
                usuarioAtual = user; usuarioId = user.id; usuarioNome = user.nome;
                localStorage.setItem('shakaUsuario', JSON.stringify(user));
                atualizarNavbar(); fecharModal();
                mostrarToast(`Bem-vindo de volta, ${nome}! 🤙`, 'ok');
            } else { mostrarToast('Senha incorreta!', 'erro'); }
        } else { mostrarToast('Usuário não encontrado! Cadastre-se primeiro.', 'erro'); }
    }
}

function logout() {
    usuarioAtual = null;
    usuarioId    = crypto.randomUUID();
    usuarioNome  = null;
    localStorage.removeItem('shakaUsuario');
    localStorage.setItem('shakaUserId', usuarioId);
    const btnLogin = document.getElementById('btnLogin');
    btnLogin.textContent = 'Login';
    btnLogin.onclick = () => abrirModalLogin();
    btnLogin.style.background = '';
    btnLogin.style.color = '';
    mostrarToast('Até logo! 🌊', 'ok');
}

// ═════════════════════════════════════════════
//   MAPA
// ═════════════════════════════════════════════
function configurarMapa() {
    map = L.map('map').setView([-3.73, -38.52], 11);
    markersLayer = L.layerGroup().addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & CARTO'
    }).addTo(map);
}

function atualizarMarcadores(lista) {
    markersLayer.clearLayers();
    lista.forEach(p => {
        const marker = L.marker([p.latitude, p.longitude], { title: p.nome }).addTo(markersLayer);
        marker.bindPopup(`<strong>${p.nome}</strong><br>${p.tipo_onda || 'Sem tipo'}<br>Popularidade: ${p.nivel_popularidade}`);
        marker.on('click', () => selecionarPraia(p));
    });
}

// ═════════════════════════════════════════════
//   PRAIAS
// ═════════════════════════════════════════════
async function carregarPraias() {
    const data = await fazerRequisicaoSupabase('praia', 'order=nivel_popularidade.desc');
    if (!data) { listaElement.innerHTML = '<p style="color:var(--text-3);padding:16px">Não foi possível carregar as praias.</p>'; return; }
    praias = data;
    renderizarLista(praias);
    atualizarMarcadores(praias);
}

function renderizarLista(lista) {
    listaElement.innerHTML = '';
    if (!lista.length) {
        listaElement.innerHTML = '<p style="color:var(--text-3);padding:16px;font-size:.9rem">Nenhuma praia encontrada.</p>';
        return;
    }
    lista.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="titulo">${p.nome}</div>
            <div class="descricao">${p.tipo_onda ? `Onda: ${p.tipo_onda}` : 'Tipo de onda não informado'} · Pop: ${p.nivel_popularidade}/5</div>
            <div class="descricao">Dificuldade: ${p.nivel_dificuldade}/5 · ${p.perigos || 'Sem perigos informados'}</div>`;
        card.addEventListener('click', () => selecionarPraia(p));
        listaElement.appendChild(card);
    });
}

function filtrarPraias() {
    const t = filtroInput.value.toLowerCase().trim();
    const filtradas = praias.filter(p =>
        p.nome.toLowerCase().includes(t) ||
        (p.tipo_onda || '').toLowerCase().includes(t) ||
        (p.perigos || '').toLowerCase().includes(t)
    );
    renderizarLista(filtradas);
    atualizarMarcadores(filtradas);
}

async function selecionarPraia(praia) {
    praiaSelecionada = praia;
    painelDetalhes.classList.remove('hidden');
    praiaNome.textContent    = praia.nome;
    praiaTipo.textContent    = praia.tipo_onda || 'Tipo não informado';
    praiaPerigos.textContent = praia.perigos   || 'Nenhum perigo listado.';

    praiaDados.innerHTML = `
        <div class="info-card"><strong>Popularidade</strong>${renderizarEstrelas(praia.nivel_popularidade)}</div>
        <div class="info-card"><strong>Dificuldade</strong>${renderizarEstrelas(praia.nivel_dificuldade)}</div>
        <div class="info-card"><strong>Latitude</strong>${praia.latitude.toFixed(5)}</div>
        <div class="info-card"><strong>Longitude</strong>${praia.longitude.toFixed(5)}</div>`;

    if (resumoIADiv) {
        resumoIADiv.innerHTML = '<div class="info-card">Clique em "Gerar resumo por IA" para analisar os comentários desta praia.</div>';
    }

    map.flyTo([praia.latitude, praia.longitude], 13, { animate: true });

    await Promise.all([
        carregarClima(praia.latitude, praia.longitude),
        carregarAnalisePraia(praia.id),
        carregarEventos(praia.id),
        carregarComentarios(praia.id)
    ]);
    fecharFormEvento();
}

function renderizarEstrelas(valor) {
    let s = '';
    for (let i = 0; i < 5; i++) s += i < valor ? '★' : '☆';
    return `<span class="rating">${s}</span>`;
}

// ═════════════════════════════════════════════
//   CLIMA · VENTO · ONDAS (Open-Meteo — grátis)
// ═════════════════════════════════════════════

// WMO weather code → emoji + descrição
const WMO_CODES = {
    0:'☀️|Céu limpo',       1:'🌤|Poucas nuvens',         2:'⛅|Parcialmente nublado', 3:'☁️|Nublado',
    45:'🌫|Névoa',           48:'🌫|Geada de névoa',
    51:'🌦|Chuvisco leve',   53:'🌦|Chuvisco mod.',        55:'🌧|Chuvisco denso',
    61:'🌧|Chuva leve',      63:'🌧|Chuva mod.',           65:'🌧|Chuva forte',
    80:'🌦|Pancadas leves',  81:'🌧|Pancadas mod.',        82:'⛈|Pancadas fortes',
    95:'⛈|Trovoada',        96:'⛈|Trovoada c/ granizo',  99:'⛈|Trovoada forte',
};

// graus → seta cardinal
function grausParaDirecao(graus) {
    const dirs  = ['N','NNE','NE','ENE','L','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
    const setas = ['↑','↗','↗','↗','→','↘','↘','↘','↓','↙','↙','↙','←','↖','↖','↖'];
    const idx   = Math.round(((graus % 360) + 360) % 360 / 22.5) % 16;
    return `${setas[idx]} ${dirs[idx]}`;
}

// Estimativa de ondas baseada no vento local quando marine API não cobre a área
// Fórmula simplificada de Sverdrup-Munk: H ≈ 0.0248 * V^2 / g  (fetch ~200km)
function estimarOndas(ventoKmh) {
    const v   = ventoKmh / 3.6;             // m/s
    const g   = 9.81;
    const F   = 200_000;                    // fetch em metros (Atlântico)
    const H   = 0.0248 * (v * v);          // altura significativa (m)
    const T   = 0.4552 * Math.sqrt(H * g); // período (s)  — aprox. Hunt
    return {
        alturaOnda:  Math.min(parseFloat(H.toFixed(1)), 6),
        periodoOnda: Math.min(Math.round(T), 20),
    };
}

// Score de surf 0-10
function calcularScoreSurf({ alturaOnda, periodoOnda, ventoKmh, wmoCode }) {
    let score = 0;

    if      (alturaOnda >= 0.8 && alturaOnda < 1.5)  score += 3;
    else if (alturaOnda >= 1.5 && alturaOnda <= 2.5) score += 4;
    else if (alturaOnda >= 0.5 && alturaOnda < 0.8)  score += 1;
    else if (alturaOnda > 2.5  && alturaOnda <= 3.5) score += 2;
    else if (alturaOnda > 3.5)                        score += 1;

    if      (periodoOnda >= 14) score += 3;
    else if (periodoOnda >= 10) score += 2;
    else if (periodoOnda >= 7)  score += 1;

    if      (ventoKmh < 10) score += 2;
    else if (ventoKmh < 20) score += 1;
    else if (ventoKmh > 40) score -= 1;

    if ([65,80,81,82,95,96,99].includes(wmoCode)) score -= 1;

    score = Math.max(0, Math.min(10, score));

    const descs = [
        'Sem condições','Muito difícil','Ruim','Fraco','Razoável',
        'Ok p/ iniciantes','Bom','Muito bom','Excelente','Épico','Épico! 🤙'
    ];
    return { score, desc: descs[score] };
}

// fetch com timeout
function fetchComTimeout(url, ms = 8000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal })
        .finally(() => clearTimeout(timer));
}

async function carregarClima(lat, lon) {
    const elLoading  = document.getElementById('climaLoading');
    const elConteudo = document.getElementById('climaConteudo');
    const elErro     = document.getElementById('climaErro');

    elLoading.classList.remove('hidden');
    elConteudo.classList.add('hidden');
    elErro.classList.add('hidden');

    // ── 1. Clima atmosférico (sempre disponível) ──────────────
    let atm;
    try {
        const urlAtm =
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,weather_code,` +
            `wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index` +
            `&wind_speed_unit=kmh&timezone=America%2FFortaleza`;

        const res = await fetchComTimeout(urlAtm, 8000);

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`HTTP ${res.status}: ${txt}`);
        }
        atm = await res.json();
    } catch (err) {
        console.error('[Clima] Falha na API atmosférica:', err.message);
        elLoading.classList.add('hidden');
        elErro.classList.remove('hidden');
        return;
    }

    // ── 2. Ondas marinhas (best-effort — falha silenciosa) ────
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
            // Confirma que os campos existem e são válidos
            if (json.current && json.current.wave_height != null) {
                ondas = json.current;
            }
        }
    } catch (err) {
        console.warn('[Clima] Marine API indisponível para estas coords — usando estimativa.');
    }

    // ── 3. Montar dados ───────────────────────────────────────
    const c = atm.current;

    const wmoCode   = c.weather_code        ?? 0;
    const ventoKmh  = c.wind_speed_10m      ?? 0;
    const rajadaKmh = c.wind_gusts_10m      ?? 0;
    const dirVento  = c.wind_direction_10m  ?? 0;
    const umidade   = c.relative_humidity_2m ?? 0;
    const uvIndex   = c.uv_index            ?? 0;
    const temp      = c.temperature_2m      ?? 0;

    // Ondas: usa marine se disponível, senão estima pelo vento
    let alturaOnda, periodoOnda, dirOnda, swellH;
    if (ondas) {
        alturaOnda  = ondas.wave_height       ?? 0;
        periodoOnda = ondas.wave_period       ?? 0;
        dirOnda     = ondas.wave_direction    ?? dirVento;
        swellH      = ondas.swell_wave_height ?? alturaOnda;
    } else {
        const est  = estimarOndas(ventoKmh);
        alturaOnda  = est.alturaOnda;
        periodoOnda = est.periodoOnda;
        dirOnda     = dirVento;
        swellH      = alturaOnda;
    }

    const { score, desc: scoreDesc } = calcularScoreSurf({ alturaOnda, periodoOnda, ventoKmh, wmoCode });

    const wmoInfo  = WMO_CODES[wmoCode] ?? '🌡|--';
    const [emoji, descClima] = wmoInfo.split('|');

    const uvLabels = ['Mínimo','Baixo','Moderado','Alto','Muito alto','Extremo'];
    const uvLabel  = uvLabels[Math.min(Math.floor(uvIndex / 3), 5)];

    const hora = new Date(c.time ?? Date.now()).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
    const fontOnda = ondas ? '' : ' (est.)';

    // ── 4. Preencher DOM ──────────────────────────────────────
    document.getElementById('climaIcone').textContent        = emoji;
    document.getElementById('climaTemp').textContent         = `${Math.round(temp)}°C`;
    document.getElementById('climaDesc').textContent         = descClima;
    document.getElementById('climaAtualizado').textContent   = `Atualizado ${hora}`;

    document.getElementById('climaVento').textContent        = `${Math.round(ventoKmh)} km/h`;
    document.getElementById('climaVentoDirecao').textContent = grausParaDirecao(dirVento);
    document.getElementById('climaRajada').textContent       = `${Math.round(rajadaKmh)} km/h`;

    document.getElementById('climaOnda').textContent         = `${alturaOnda.toFixed(1)} m${fontOnda}`;
    document.getElementById('climaOndaPeriodo').textContent  = `${periodoOnda}s`;

    // Maré / swell
    document.getElementById('climaMare').textContent         = `${swellH.toFixed(1)} m`;
    document.getElementById('climaMareTendencia').textContent = swellH >= 1.0 ? 'Maré alta' : 'Maré baixa';

    document.getElementById('climaUmidade').textContent      = `${umidade}%`;
    document.getElementById('climaUV').textContent           = uvIndex.toFixed(1);
    document.getElementById('climaUVLabel').textContent      = uvLabel;

    // Score barra
    const scoreColor = score >= 7 ? '#2dd4bf' : score >= 5 ? '#f59e0b' : '#ef4444';
    document.getElementById('climaScoreNum').textContent  = `${score}/10`;
    document.getElementById('climaScoreDesc').textContent = scoreDesc;
    const fill = document.getElementById('climaScoreFill');
    fill.style.width      = `${score * 10}%`;
    fill.style.background = scoreColor;

    elLoading.classList.add('hidden');
    elConteudo.classList.remove('hidden');
}

// ═════════════════════════════════════════════
//   ANÁLISE DE PRAIA
// ═════════════════════════════════════════════
async function carregarAnalisePraia(idPraia) {
    const data = await fazerRequisicaoSupabase('analisePraia', `id_praia=eq.${idPraia}`);
    if (!data || data.length === 0) {
        analisePraia.innerHTML = '<div class="info-card">Nenhuma análise disponível.</div>';
        return;
    }
    const a = data[0];
    analisePraia.innerHTML = `
        <div class="info-card"><strong>Pedras</strong>${a.pedras ? 'Sim' : 'Não'}</div>
        <div class="info-card"><strong>Corrente forte</strong>${a.corrente_forte ? 'Sim' : 'Não'}</div>
        <div class="info-card"><strong>Ondas fortes</strong>${a.ondas_fortes ? 'Sim' : 'Não'}</div>`;
}

// ═════════════════════════════════════════════
//   EVENTOS
// ═════════════════════════════════════════════
async function carregarEventos(idPraia) {
    const data = await fazerRequisicaoSupabase('evento', `id_praia=eq.${idPraia}&order=data.asc`);
    if (!data || data.length === 0) {
        eventosDiv.innerHTML = '<div class="info-card">Nenhum evento cadastrado.</div>';
        return;
    }
    eventosDiv.innerHTML = data.map(e => `
        <div class="info-card">
            <strong>${e.titulo}</strong>
            <p style="margin-top:4px">${e.descricao || 'Sem descrição'}</p>
            <span style="font-size:.78rem;color:var(--text-3)">${new Date(e.data).toLocaleDateString('pt-BR')}</span>
        </div>`).join('');
}

function abrirFormEvento() {
    if (!usuarioAtual) { mostrarToast('Faça login para adicionar eventos!', 'erro'); abrirModalLogin(); return; }
    document.getElementById('formEvento').style.display         = 'block';
    document.getElementById('btnAdicionarEvento').style.display = 'none';
}

function fecharFormEvento() {
    document.getElementById('formEvento').style.display         = 'none';
    document.getElementById('btnAdicionarEvento').style.display = 'block';
    document.getElementById('eventoTitulo').value    = '';
    document.getElementById('eventoDescricao').value = '';
    document.getElementById('eventoData').value      = '';
}

function cancelarEvento() { fecharFormEvento(); }

async function criarEvento() {
    if (!praiaSelecionada) { mostrarToast('Selecione uma praia primeiro!', 'erro'); return; }
    const titulo   = document.getElementById('eventoTitulo').value.trim();
    const descricao = document.getElementById('eventoDescricao').value.trim();
    const data     = document.getElementById('eventoData').value;
    if (!titulo || !data) { mostrarToast('Preencha título e data!', 'erro'); return; }

    const novoEvento = { titulo, descricao, data, id_praia: praiaSelecionada.id };
    let ok = await fazerRequisicaoSupabase('evento', '', 'POST', novoEvento);
    if (!ok) ok = await fazerRequisicaoSupabase('Evento', '', 'POST', novoEvento);

    if (ok) {
        mostrarToast('Evento criado! 📅', 'ok');
        fecharFormEvento();
        await carregarEventos(praiaSelecionada.id);
    } else { mostrarToast('Erro ao criar evento.', 'erro'); }
}

// ═════════════════════════════════════════════
//   COMENTÁRIOS
// ═════════════════════════════════════════════
async function carregarComentarios(idPraia) {
    const data = await fazerRequisicaoSupabase('comentario', `id_praia=eq.${idPraia}&order=data.desc`);
    if (!data || data.length === 0) {
        comentariosDiv.innerHTML = '<div class="info-card">Seja o primeiro a comentar.</div>';
        return;
    }
    comentariosDiv.innerHTML = data.map(c => `
        <div class="comentario-item">
            <span>${c.tipo || 'Comentário'} · ${new Date(c.data).toLocaleString('pt-BR')}</span>
            <p>${c.texto}</p>
        </div>`).join('');
}

async function enviarComentario() {
    if (!praiaSelecionada) { mostrarToast('Selecione uma praia primeiro!', 'erro'); return; }
    const texto = comentarioInput.value.trim();
    if (!texto) { mostrarToast('Digite uma mensagem antes de enviar.', 'erro'); return; }

    const ok = await fazerRequisicaoSupabase('comentario', '', 'POST', {
        texto, tipo: 'avaliacao',
        id_praia: praiaSelecionada.id,
        id_usuario: usuarioId,
        data: new Date().toISOString()
    });

    if (ok) {
        comentarioInput.value = '';
        mostrarToast('Comentário enviado! 🤙', 'ok');
        await carregarComentarios(praiaSelecionada.id);
    } else { mostrarToast('Não foi possível enviar o comentário.', 'erro'); }
}

// ═════════════════════════════════════════════
//   SERVIÇOS  (independentes de praia)
// ═════════════════════════════════════════════
const SERVICO_META = {
    aluguel:     { icone: '🏄', label: 'Aluguel'       },
    aula:        { icone: '🎓', label: 'Aula de Surf'  },
    reparo:      { icone: '🔧', label: 'Reparo'         },
    hospedagem:  { icone: '🏠', label: 'Hospedagem'     },
    alimentacao: { icone: '🍽️', label: 'Alimentação'    },
    transporte:  { icone: '🚐', label: 'Transporte'     },
    fotografia:  { icone: '📷', label: 'Fotografia'     },
    outro:       { icone: '📌', label: 'Outro'          },
};

async function carregarServicos() {
    const grid = document.getElementById('listaServicos');
    grid.innerHTML = renderizarSkeletonServicos();

    const data = await fazerRequisicaoSupabase('servico', 'order=id.desc');
    todosServicos = data || [];
    renderizarGridServicos(todosServicos);
}

function renderizarSkeletonServicos() {
    return Array(6).fill(0).map(() => `
        <div class="servico-card" style="opacity:.4;pointer-events:none">
            <div class="servico-card-topo">
                <div class="servico-icone-wrap" style="background:var(--bg-card-2)"></div>
                <div style="flex:1">
                    <div style="height:14px;background:var(--bg-card-2);border-radius:6px;width:70%;margin-bottom:8px"></div>
                    <div style="height:10px;background:var(--bg-card-2);border-radius:99px;width:40%"></div>
                </div>
            </div>
            <div style="height:48px;background:var(--bg-card-2);border-radius:8px"></div>
            <div class="servico-rodape" style="border-top:1px solid var(--border)">
                <div style="height:10px;background:var(--bg-card-2);border-radius:6px;width:55%"></div>
            </div>
        </div>`).join('');
}

function renderizarGridServicos(lista) {
    const grid = document.getElementById('listaServicos');

    if (!lista.length) {
        grid.innerHTML = `
            <div class="servicos-vazio">
                <div class="servicos-vazio-icone">🏄</div>
                <p class="servicos-vazio-texto">Nenhum serviço encontrado.</p>
                <p class="servicos-vazio-sub">Seja o primeiro a cadastrar um serviço para a comunidade!</p>
            </div>`;
        return;
    }

    grid.innerHTML = lista.map(s => {
        const meta    = SERVICO_META[s.tipo] || SERVICO_META.outro;
        const contato = s.contato
            ? `<a class="servico-contato" href="tel:${s.contato}">${s.contato}</a>`
            : `<span class="servico-sem-contato">Contato não informado</span>`;
        return `
        <div class="servico-card" data-tipo="${s.tipo || 'outro'}">
            <div class="servico-card-topo">
                <div class="servico-icone-wrap">${meta.icone}</div>
                <div>
                    <span class="servico-nome">${s.nome}</span>
                    <span class="servico-tipo-badge">${meta.label}</span>
                </div>
            </div>
            ${s.descricao ? `<p class="servico-descricao">${s.descricao}</p>` : ''}
            <div class="servico-rodape">${contato}</div>
        </div>`;
    }).join('');
}

// Filtro client-side (tipo + busca por texto)
function filtrarServicos(tipoAtivo = '') {
    const termo = (document.getElementById('filtroServico')?.value || '').toLowerCase().trim();
    const resultado = todosServicos.filter(s => {
        const bateTipo = !tipoAtivo || s.tipo === tipoAtivo;
        const bateTexto = !termo ||
            (s.nome        || '').toLowerCase().includes(termo) ||
            (s.descricao   || '').toLowerCase().includes(termo) ||
            (s.tipo        || '').toLowerCase().includes(termo) ||
            (s.contato     || '').toLowerCase().includes(termo);
        return bateTipo && bateTexto;
    });
    renderizarGridServicos(resultado);
}

// ── Modal de serviço ──────────────────────────────────────────
function abrirModalServico() {
    if (!usuarioAtual) {
        mostrarToast('Faça login para cadastrar um serviço!', 'erro');
        abrirModalLogin();
        return;
    }
    document.getElementById('modalServico').classList.add('active');
}

function fecharModalServico() {
    document.getElementById('modalServico').classList.remove('active');
    document.getElementById('servicoNome').value      = '';
    document.getElementById('servicoTipo').value      = '';
    document.getElementById('servicoDescricao').value = '';
    document.getElementById('servicoContato').value   = '';
}

async function criarServico() {
    const nome      = document.getElementById('servicoNome').value.trim();
    const tipo      = document.getElementById('servicoTipo').value;
    const descricao = document.getElementById('servicoDescricao').value.trim();
    const contato   = document.getElementById('servicoContato').value.trim();

    if (!nome || !tipo) {
        mostrarToast('Preencha pelo menos o nome e o tipo do serviço!', 'erro');
        return;
    }

    // Feedback no botão
    const btn = document.getElementById('btnSalvarServico');
    const txtOriginal = btn.textContent;
    btn.innerHTML = '<span class="loading-spinner"></span> Salvando...';
    btn.disabled  = true;

    const novoServico = {
        nome,
        tipo,
        descricao: descricao || null,
        contato:   contato   || null
        // SEM id_praia — tabela não tem essa coluna
    };

    const ok = await fazerRequisicaoSupabase('servico', '', 'POST', novoServico);

    btn.textContent = txtOriginal;
    btn.disabled    = false;

    if (ok) {
        mostrarToast(`"${nome}" cadastrado com sucesso! 🤙`, 'ok');
        fecharModalServico();
        await carregarServicos(); // recarrega o grid
    } else {
        mostrarToast('Erro ao cadastrar. Verifique as permissões no Supabase.', 'erro');
    }
}

// ═════════════════════════════════════════════
//   TOAST
// ═════════════════════════════════════════════
function mostrarToast(mensagem, tipo = 'ok') {
    let toast = document.getElementById('shakaToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'shakaToast';
        document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.className   = `shaka-toast shaka-toast--${tipo} shaka-toast--show`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('shaka-toast--show'), 3200);
}

// ═════════════════════════════════════════════
//   RESUMO IA — análise local de comentários
// ═════════════════════════════════════════════

async function buscarComentariosDaPraia(idPraia) {
    const data = await fazerRequisicaoSupabase('comentario', `id_praia=eq.${idPraia}&order=data.desc`);
    return data || [];
}

async function gerarResumoIA() {
    if (!praiaSelecionada) {
        mostrarToast('Selecione uma praia primeiro.', 'erro');
        return;
    }

    resumoIADiv.innerHTML = '<div class="info-card">Analisando comentários da praia...</div>';

    const comentarios = await buscarComentariosDaPraia(praiaSelecionada.id);

    if (!comentarios || comentarios.length === 0) {
        renderizarResumoIA({
            resumo: 'Ainda não há comentários suficientes para gerar uma análise automática desta praia.',
            pontos_positivos: [],
            pontos_negativos: [],
            dicas: ['Seja o primeiro a comentar para ajudar outros usuários do Shaka.'],
            sentimento_geral: 'sem dados suficientes'
        });
        return;
    }

    renderizarResumoIA(analisarComentariosLocal(comentarios, praiaSelecionada));
}

function analisarComentariosLocal(comentarios, praia) {
    const textos     = comentarios.map(c => c.texto || '').filter(t => t.trim() !== '');
    const textoGeral = textos.join(' ').toLowerCase();

    const palavrasPositivas  = ['boa','bom','ótima','otima','excelente','maravilhosa','bonita','limpa','tranquila','segura','agradável','agradavel','recomendo','legal','perfeita','incrível','incrivel','top','linda','calma','organizada','gostei','vale a pena'];
    const palavrasNegativas  = ['ruim','péssima','pessima','suja','lixo','perigosa','perigo','assalto','violenta','lotada','cheia','cara','problema','arriscado','corrente forte','poluída','poluida','mal cuidada','desorganizada','não recomendo','nao recomendo'];
    const palavrasSurf       = ['onda','ondas','surf','surfar','surfista','mar','vento','corrente','pedra','pedras','forte','tubo','maré','mare'];
    const palavrasEstrutura  = ['barraca','barracas','restaurante','estacionamento','banheiro','quiosque','serviço','servico','comida','atendimento','hotel','pousada','guarda-vidas','salva-vidas'];

    const positivos       = contarOcorrenciasIA(textoGeral, palavrasPositivas);
    const negativos       = contarOcorrenciasIA(textoGeral, palavrasNegativas);
    const termosSurf      = contarOcorrenciasIA(textoGeral, palavrasSurf);
    const termosEstrutura = contarOcorrenciasIA(textoGeral, palavrasEstrutura);

    let sentimento_geral = 'neutro';
    if (textos.length < 2)                        sentimento_geral = 'sem dados suficientes';
    else if (positivos > negativos + 1)           sentimento_geral = negativos > 0 ? 'positivo com ressalvas' : 'positivo';
    else if (negativos > positivos + 1)           sentimento_geral = 'negativo';
    else if (positivos > 0 && negativos > 0)      sentimento_geral = 'positivo com ressalvas';

    const pontos_positivos = [];
    if (positivos > 0)                            pontos_positivos.push('Os comentários apresentam percepções positivas sobre a praia.');
    if (termosSurf > 0)                           pontos_positivos.push('Há menções relacionadas ao mar, ondas ou prática de surf.');
    if (termosEstrutura > 0)                      pontos_positivos.push('Alguns comentários indicam presença de estrutura ou serviços próximos.');
    if (Number(praia.nivel_popularidade) >= 4)    pontos_positivos.push('A praia possui alto nível de popularidade cadastrado no sistema.');
    if (pontos_positivos.length === 0)            pontos_positivos.push('Ainda há poucas informações positivas identificadas automaticamente.');

    const pontos_negativos = [];
    if (negativos > 0)                            pontos_negativos.push('Foram identificadas ressalvas ou críticas nos comentários dos usuários.');
    if ((praia.perigos || '').trim() !== '')       pontos_negativos.push(`Perigos cadastrados: ${praia.perigos}.`);
    if (Number(praia.nivel_dificuldade) >= 4)     pontos_negativos.push('O nível de dificuldade cadastrado é elevado.');
    if (textoGeral.includes('corrente') || textoGeral.includes('pedra')) pontos_negativos.push('Existem menções a possíveis riscos naturais, como corrente ou pedras.');
    if (pontos_negativos.length === 0)            pontos_negativos.push('Nenhum ponto negativo forte foi identificado automaticamente.');

    const dicas = [];
    if (Number(praia.nivel_dificuldade) >= 4)     dicas.push('Recomendada maior cautela para iniciantes devido ao nível de dificuldade.');
    if ((praia.perigos || '').trim() !== '')       dicas.push('Verifique os perigos informados antes de entrar no mar.');
    if (textoGeral.includes('lotada') || textoGeral.includes('cheia')) dicas.push('Evite horários de pico caso prefira uma experiência mais tranquila.');
    if (termosSurf > 0)                           dicas.push('Confira as condições do mar antes de surfar.');
    if (dicas.length === 0)                       dicas.push('Leia os comentários recentes para entender melhor as condições atuais da praia.');

    let resumo = `Com base em ${textos.length} comentário(s), a praia ${praia.nome} apresenta uma percepção geral `;
    if      (sentimento_geral === 'positivo')               resumo += 'positiva entre os usuários.';
    else if (sentimento_geral === 'negativo')               resumo += 'negativa, com críticas relevantes nos comentários.';
    else if (sentimento_geral === 'positivo com ressalvas') resumo += 'positiva, mas com algumas ressalvas apontadas pelos usuários.';
    else if (sentimento_geral === 'sem dados suficientes')  resumo += 'ainda limitada, pois há poucos comentários disponíveis.';
    else                                                     resumo += 'neutra ou mista, sem predominância clara.';
    if (termosSurf > 0)      resumo += ' A análise identificou menções relacionadas ao mar, ondas ou surf.';
    if (termosEstrutura > 0) resumo += ' Também há indicações de estrutura ou serviços próximos.';
    if (negativos > 0)       resumo += ' Alguns comentários indicam pontos de atenção antes da visita.';

    return { resumo, pontos_positivos, pontos_negativos, dicas, sentimento_geral };
}

function contarOcorrenciasIA(texto, palavras) {
    return palavras.reduce((total, p) => total + (texto.includes(p) ? 1 : 0), 0);
}

function renderizarResumoIA(resumo) {
    const sentimentoCores = {
        'positivo':               '#22c55e',
        'positivo com ressalvas': '#f59e0b',
        'negativo':               '#ef4444',
        'neutro':                 '#94a3b8',
        'sem dados suficientes':  '#94a3b8'
    };
    const cor = sentimentoCores[resumo.sentimento_geral] || '#94a3b8';

    resumoIADiv.innerHTML = `
        <div class="info-card">
            <strong>Resumo geral</strong>
            <p style="margin-top:6px;line-height:1.6">${resumo.resumo}</p>
        </div>
        <div class="info-card">
            <strong>✅ Pontos positivos</strong>
            <ul style="margin:6px 0 0 16px;line-height:1.8">
                ${(resumo.pontos_positivos || []).map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
        <div class="info-card">
            <strong>⚠️ Pontos negativos</strong>
            <ul style="margin:6px 0 0 16px;line-height:1.8">
                ${(resumo.pontos_negativos || []).map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
        <div class="info-card">
            <strong>💡 Dicas</strong>
            <ul style="margin:6px 0 0 16px;line-height:1.8">
                ${(resumo.dicas || []).map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
        <div class="info-card" style="display:flex;align-items:center;gap:8px">
            <strong>Sentimento geral:</strong>
            <span style="color:${cor};font-weight:600">${resumo.sentimento_geral || 'Não informado'}</span>
        </div>`;
}