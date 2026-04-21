// ⚽ Fútbol Live PWA — ESPN API
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

const LEAGUES = [
    { slug: 'esp.1',          name: 'La Liga',              country: 'España',       flag: '🇪🇸' },
    { slug: 'eng.1',          name: 'Premier League',       country: 'Inglaterra',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { slug: 'ita.1',          name: 'Serie A',              country: 'Italia',       flag: '🇮🇹' },
    { slug: 'ger.1',          name: 'Bundesliga',           country: 'Alemania',     flag: '🇩🇪' },
    { slug: 'fra.1',          name: 'Ligue 1',              country: 'Francia',      flag: '🇫🇷' },
    { slug: 'den.1',          name: 'Danish Superliga',     country: 'Dinamarca',    flag: '🇩🇰' },
    { slug: 'ned.1',          name: 'Eredivisie',           country: 'Países Bajos', flag: '🇳🇱' },
    { slug: 'nor.1',          name: 'Eliteserien',          country: 'Noruega',      flag: '🇳🇴' },
    { slug: 'por.1',          name: 'Primeira Liga',        country: 'Portugal',     flag: '🇵🇹' },
    { slug: 'chi.1',          name: 'Primera División',     country: 'Chile',        flag: '🇨🇱' },
    { slug: 'bra.1',          name: 'Brasileirão',          country: 'Brasil',       flag: '🇧🇷' },
    { slug: 'uefa.champions', name: 'Champions League',     country: 'Europa',       flag: '🏆' },
];

let autoRefreshInterval = null;
let currentTab = 'live';

// DOM
const liveMatchesEl    = document.getElementById('live-matches');
const upcomingMatchesEl= document.getElementById('upcoming-matches');
const liveCountEl      = document.getElementById('live-count');
const upcomingCountEl  = document.getElementById('upcoming-count');
const lastUpdatedEl    = document.getElementById('last-updated');
const refreshBtn       = document.getElementById('refresh-btn');
const settingsBtn      = document.getElementById('settings-btn');
const settingsModal    = document.getElementById('settings-modal');
const toastEl          = document.getElementById('toast');

// ── Toast ────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    toastEl.textContent = msg;
    toastEl.className = `toast ${type}`;
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.add('hidden'), 2800);
}

// ── Formatters ───────────────────────────────────────────
function formatTime(utcDate) {
    return new Date(utcDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(utcDate) {
    const d = new Date(utcDate);
    const today    = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString())    return 'Hoy · ' + formatTime(utcDate);
    if (d.toDateString() === tomorrow.toDateString()) return 'Mañana · ' + formatTime(utcDate);
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + formatTime(utcDate);
}

// ── Fetch ────────────────────────────────────────────────
async function fetchAllLeagues() {
    return Promise.all(LEAGUES.map(async league => {
        try {
            const res = await fetch(`${ESPN_BASE}/${league.slug}/scoreboard`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return { league, data: await res.json() };
        } catch (e) {
            console.warn(`[${league.name}]`, e.message);
            return { league, data: null };
        }
    }));
}

function parseESPNMatches(leagueInfo, espnData) {
    if (!espnData?.events?.length) return [];
    const matches = [];
    espnData.events.forEach(event => {
        const comp   = event.competitions?.[0];
        if (!comp) return;
        const home   = comp.competitors?.find(c => c.homeAway === 'home') || comp.competitors?.[0];
        const away   = comp.competitors?.find(c => c.homeAway === 'away') || comp.competitors?.[1];
        if (!home || !away) return;
        const status = comp.status || event.status || {};
        const state  = status.state || status.type?.state || 'pre';
        const isLive = state === 'in' || status.type?.name === 'STATUS_IN_PROGRESS';
        if (state === 'post' || status.type?.name === 'STATUS_FINAL') return;
        matches.push({
            id: event.id,
            league: leagueInfo.name,
            country: leagueInfo.country,
            flag: leagueInfo.flag,
            homeTeam: {
                name: home.team?.shortDisplayName || home.team?.displayName || 'Local',
                logo: home.team?.logo || '',
                score: parseInt(home.score) || 0
            },
            awayTeam: {
                name: away.team?.shortDisplayName || away.team?.displayName || 'Visitante',
                logo: away.team?.logo || '',
                score: parseInt(away.score) || 0
            },
            state,
            minute: status.displayClock || status.clock || '0\'',
            utcDate: event.date || comp.date,
            isLive,
            isUpcoming: state === 'pre'
        });
    });
    return matches;
}

// ── Render ───────────────────────────────────────────────
function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = `match-card ${match.isLive ? 'live' : 'upcoming'}`;

    const statusPill = match.isLive
        ? `<div class="status-pill live">${match.minute}</div>`
        : `<div class="status-pill upcoming">${formatDate(match.utcDate)}</div>`;

    const FALLBACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='19' fill='%23131720'/%3E%3C/svg%3E`;

    card.innerHTML = `
        <div class="team-col">
            <div class="team-logo-wrap">
                <img src="${match.homeTeam.logo || FALLBACK}" alt="${match.homeTeam.name}" onerror="this.src='${FALLBACK}'">
            </div>
            <div class="team-name">${match.homeTeam.name}</div>
        </div>

        <div class="score-col">
            <div class="score-board">
                <span class="score-num">${match.isLive ? match.homeTeam.score : '—'}</span>
                <span class="score-sep">:</span>
                <span class="score-num">${match.isLive ? match.awayTeam.score : '—'}</span>
            </div>
            ${statusPill}
        </div>

        <div class="team-col">
            <div class="team-logo-wrap">
                <img src="${match.awayTeam.logo || FALLBACK}" alt="${match.awayTeam.name}" onerror="this.src='${FALLBACK}'">
            </div>
            <div class="team-name">${match.awayTeam.name}</div>
        </div>
    `;
    return card;
}

// Group matches by league and render
function renderMatches(container, matches, emptyMsg, emptyIcon = '📭') {
    container.innerHTML = '';

    if (!matches.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon-wrap">${emptyIcon}</div>
                <h3>${emptyMsg}</h3>
                <p>Intenta actualizar en unos minutos.</p>
            </div>`;
        return;
    }

    // Group by league
    const groups = {};
    matches.forEach(m => {
        const key = m.league;
        if (!groups[key]) groups[key] = { meta: m, items: [] };
        groups[key].items.push(m);
    });

    Object.values(groups).forEach(({ meta, items }) => {
        const group = document.createElement('div');
        group.className = 'league-group';
        group.innerHTML = `
            <div class="league-group-header">
                <span class="flag">${meta.flag}</span>
                ${meta.league}
            </div>`;
        items.forEach(m => group.appendChild(createMatchCard(m)));
        container.appendChild(group);
    });
}

// ── Load Data ────────────────────────────────────────────
async function loadData() {
    // Skeleton already in HTML on first load; on refresh show mini skeletons
    if (liveMatchesEl.querySelector('.league-group, .empty-state')) {
        liveMatchesEl.innerHTML     = '<div class="skeleton-wrap"><div class="skeleton-card"></div><div class="skeleton-card"></div></div>';
        upcomingMatchesEl.innerHTML = '<div class="skeleton-wrap"><div class="skeleton-card"></div><div class="skeleton-card"></div></div>';
    }

    try {
        const results = await fetchAllLeagues();
        const allLive = [], allUpcoming = [];

        results.forEach(({ league, data }) => {
            if (!data) return;
            parseESPNMatches(league, data).forEach(m => {
                if (m.isLive)     allLive.push(m);
                else if (m.isUpcoming) allUpcoming.push(m);
            });
        });

        allLive.sort((a, b) => (parseInt(b.minute) || 0) - (parseInt(a.minute) || 0));
        allUpcoming.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

        liveCountEl.textContent     = allLive.length;
        upcomingCountEl.textContent = allUpcoming.length;

        renderMatches(liveMatchesEl,     allLive,              'No hay partidos en vivo', '⚽');
        renderMatches(upcomingMatchesEl, allUpcoming.slice(0, 50), 'No hay próximos partidos', '📅');

        const now = new Date();
        lastUpdatedEl.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        showToast(`${allLive.length + allUpcoming.length} partidos · ESPN`);
    } catch (err) {
        console.error(err);
        [liveMatchesEl, upcomingMatchesEl].forEach(el => {
            el.innerHTML = `<div class="empty-state"><div class="empty-icon-wrap">⚠️</div><h3>Error de conexión</h3><p>${err.message}</p></div>`;
        });
        showToast('No se pudo conectar con ESPN', 'error');
    }
}

// ── Tabs ─────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        currentTab = tab.dataset.tab;
    });
});

// ── Settings ─────────────────────────────────────────────
function setupSettings() {
    const saved = localStorage.getItem('auto_refresh_interval') || '45';
    document.querySelectorAll('.seg-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === saved);
        btn.addEventListener('click', () => {
            document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    document.getElementById('close-settings').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('close-settings-bg').addEventListener('click', () => settingsModal.classList.add('hidden'));

    document.getElementById('save-settings').addEventListener('click', () => {
        const val = document.querySelector('.seg-btn.active')?.dataset.val || '45';
        localStorage.setItem('auto_refresh_interval', val);
        setupAutoRefresh();
        settingsModal.classList.add('hidden');
        showToast('Configuración guardada');
        loadData();
    });
}

// ── Auto refresh ─────────────────────────────────────────
function setupAutoRefresh() {
    clearInterval(autoRefreshInterval);
    const secs = parseInt(localStorage.getItem('auto_refresh_interval') || '45');
    if (secs > 0) {
        autoRefreshInterval = setInterval(() => {
            if (!settingsModal.classList.contains('hidden')) return;
            loadData();
        }, secs * 1000);
    }
}

// ── Refresh button ────────────────────────────────────────
refreshBtn.addEventListener('click', () => {
    refreshBtn.classList.add('spinning');
    loadData().finally(() => refreshBtn.classList.remove('spinning'));
});

document.addEventListener('keydown', e => {
    if (e.key === 'r' && document.activeElement.tagName !== 'INPUT') loadData();
});

// ── Service Worker ────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ── Init ──────────────────────────────────────────────────
setupSettings();
setupAutoRefresh();
loadData();
window.loadData = loadData;
