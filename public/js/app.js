// =========================================================
// Genshin Flood Dashboard — Modern Client App
// =========================================================

const I18N = {
  ua: {
    headerSubtitle: "Система чисток і рестів",
    navAdmin: "Адмін",
    demoBanner: "Демо-режим: показано тестові дані Мандрівників.",
    heroEyebrow: "Флуд-чат · Тейват",
    heroTitle: "Флуд Геншин Імпакт",
    heroDesc: "Слідкуй за тижневою нормою, рейтингом і статусом реста.",
    countdownLabel: "До недільної чистки",
    unitDays: "дн",
    unitHours: "год",
    unitMins: "хв",
    unitSecs: "сек",
    cleanInfo: "Неділя · 20:00 (GMT+3)",
    statMembers: "Учасників",
    statMembersSub: "активних мандрівників",
    statQuota: "Норма",
    statQuotaSub: "повідомлень на тиждень",
    statWeekly: "Флуд за тиждень",
    statWeeklySub: "повідомлень у чаті",
    statRest: "На ресті",
    statRestSub: "мають імунітет",
    boardTitle: "Таблиця лідерів",
    tabWeekly: "Тиждень",
    tabAllTime: "Весь час",
    searchPlaceholder: "Ім'я, @username або UID…",
    searchHint: "Enter — знайти в базі Тейвату",
    searchNotFound: "Мандрівника не знайдено у списку",
    searchSearching: "Пошук у базі даних…",
    profileEmptyTitle: "Паспорт мандрівника",
    profileEmptyText: "Обери учасника в таблиці або знайди себе через пошук.",
    warnsLabel: "Попередження",
    quotaLabel: "Тижнева норма",
    quotaDone: "✨ Норму виконано!",
    quotaRemaining: "Залишилось: {n} пов.",
    mDay: "Сьогодні",
    mWeek: "Тиждень",
    mMonth: "Місяць",
    mTotal: "Весь час",
    restUntil: "Рест до",
    restReason: "Причина",
    statusActive: "В строю",
    statusRest: "На ресті",
    statusWarned: "Під загрозою",
    footer: "Genshin Flood Bot · Telegram + Google Sheets",
    noData: "Поки що немає даних активності.",
    rankPrefix: "#"
  },
  eng: {
    headerSubtitle: "Cleanup & rest system",
    navAdmin: "Admin",
    demoBanner: "Demo mode: displaying sample Traveler data.",
    heroEyebrow: "Flood chat · Teyvat",
    heroTitle: "Genshin Impact Flood",
    heroDesc: "Track weekly chat quota, leaderboard ranking, and rest immunity.",
    countdownLabel: "Until Sunday cleanup",
    unitDays: "d",
    unitHours: "h",
    unitMins: "m",
    unitSecs: "s",
    cleanInfo: "Sunday · 20:00 (GMT+3)",
    statMembers: "Members",
    statMembersSub: "active travelers",
    statQuota: "Quota",
    statQuotaSub: "msgs per week",
    statWeekly: "Weekly Flood",
    statWeeklySub: "messages in chat",
    statRest: "On Rest",
    statRestSub: "have immunity",
    boardTitle: "Leaderboard",
    tabWeekly: "This week",
    tabAllTime: "All time",
    searchPlaceholder: "Name, @username or UID…",
    searchHint: "Press Enter to search database",
    searchNotFound: "Traveler not found in the list",
    searchSearching: "Searching database…",
    profileEmptyTitle: "Traveler Passport",
    profileEmptyText: "Select a traveler from the board or search your profile.",
    warnsLabel: "Warnings",
    quotaLabel: "Weekly quota",
    quotaDone: "✨ Quota completed!",
    quotaRemaining: "{n} msgs remaining",
    mDay: "Today",
    mWeek: "Week",
    mMonth: "Month",
    mTotal: "All time",
    restUntil: "Rest until",
    restReason: "Reason",
    statusActive: "Active",
    statusRest: "On Rest",
    statusWarned: "At Risk",
    footer: "Genshin Flood Bot · Telegram + Google Sheets",
    noData: "No activity data recorded yet.",
    rankPrefix: "#"
  },
  ru: {
    headerSubtitle: "Система чисток и рестов",
    navAdmin: "Админ",
    demoBanner: "Демо-режим: показаны тестовые данные Путешественников.",
    heroEyebrow: "Флуд-чат · Тейват",
    heroTitle: "Флуд Геншин Импакт",
    heroDesc: "Следи за недельной нормой, рейтингом и статусом реста.",
    countdownLabel: "До воскресной чистки",
    unitDays: "дн",
    unitHours: "ч",
    unitMins: "мин",
    unitSecs: "сек",
    cleanInfo: "Воскресенье · 20:00 (GMT+3)",
    statMembers: "Участников",
    statMembersSub: "активных путешественников",
    statQuota: "Норма",
    statQuotaSub: "сообщений в неделю",
    statWeekly: "Флуд за неделю",
    statWeeklySub: "сообщений в чате",
    statRest: "На ресте",
    statRestSub: "имеют иммунитет",
    boardTitle: "Таблица лидеров",
    tabWeekly: "Неделя",
    tabAllTime: "Всё время",
    searchPlaceholder: "Имя, @username или UID…",
    searchHint: "Enter — найти в базе Тейвата",
    searchNotFound: "Путешественник не найден в списке",
    searchSearching: "Поиск в базе данных…",
    profileEmptyTitle: "Паспорт путешественника",
    profileEmptyText: "Выбери участника в таблице или найди себя через поиск.",
    warnsLabel: "Предупреждения",
    quotaLabel: "Недельная норма",
    quotaDone: "✨ Норма выполнена!",
    quotaRemaining: "Осталось: {n} сообщ.",
    mDay: "Сегодня",
    mWeek: "Неделя",
    mMonth: "Месяц",
    mTotal: "Всё время",
    restUntil: "Рест до",
    restReason: "Причина",
    statusActive: "В строю",
    statusRest: "На ресте",
    statusWarned: "Под угрозой",
    footer: "Genshin Flood Bot · Telegram + Google Sheets",
    noData: "Пока нет данных активности.",
    rankPrefix: "#"
  }
};

const ELEMENTS = ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo'];

let currentLang = localStorage.getItem('flood_lang') || 'ua';
if (!I18N[currentLang]) currentLang = 'ua';

let chatState = null;
let currentTab = 'weekly';
let countdownTimer = null;
let selectedUserId = null;

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initTabs();
  initSearch();
  loadStats();
});

// ---------- Multi-Language ----------
function initLanguage() {
  setLanguage(currentLang);

  document.querySelectorAll('.segmented__btn[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang && I18N[lang]) {
        setLanguage(lang);
      }
    });
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('flood_lang', lang);

  document.querySelectorAll('.segmented__btn[data-lang]').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
  });

  const t = I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) {
      el.placeholder = t[key];
    }
  });

  if (chatState) {
    renderLeaderboard();
    if (selectedUserId) {
      const u = findUserById(selectedUserId);
      if (u) displayProfile(u);
    }
  }
}

function t(key, params = {}) {
  let str = (I18N[currentLang] && I18N[currentLang][key]) || (I18N.ua && I18N.ua[key]) || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

// ---------- Tabs & Search ----------
function initTabs() {
  document.querySelectorAll('.panel__head .segmented__btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.panel__head .segmented__btn[data-tab]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentTab = btn.getAttribute('data-tab');
      renderLeaderboard();
    });
  });
}

function initSearch() {
  const input = document.getElementById('searchInput');
  const hint = document.getElementById('searchHint');
  if (!input) return;

  input.addEventListener('input', () => {
    if (hint) {
      hint.classList.remove('is-error');
      hint.textContent = t('searchHint');
    }
    renderLeaderboard(input.value.trim());
  });

  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      executeDatabaseSearch(input.value.trim());
    }
  });
}

// ---------- Data Loading & Offline Demo ----------
async function loadStats() {
  const isFile = window.location.protocol === 'file:';
  const demoBanner = document.getElementById('demoBanner');

  if (!isFile) {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        chatState = await res.json();
        onStatsLoaded(false);
        return;
      }
    } catch (err) {
      console.warn('API unreachable, falling back to Genshin preview demo data:', err.message);
    }
  }

  // Fallback demo data
  if (demoBanner) demoBanner.hidden = false;
  chatState = generateDemoData();
  onStatsLoaded(true);
}

function onStatsLoaded(isDemo) {
  updateStatsOverview(chatState.chat);
  startCountdown(chatState.chat.next_clean_date);
  renderLeaderboard();

  // Check URL query for direct passport lookup
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id') || urlParams.get('uid') || urlParams.get('user');
  if (targetId) {
    const input = document.getElementById('searchInput');
    if (input) input.value = targetId;
    executeDatabaseSearch(targetId);
  } else if (chatState.weekly_top && chatState.weekly_top[0]) {
    // Select top 1 by default
    selectUser(chatState.weekly_top[0]);
  }
}

function generateDemoData() {
  const nextSunday = new Date();
  nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));
  nextSunday.setHours(20, 0, 0, 0);

  const demoUsers = [
    { uid: '700000001', telegram_id: '101', username: '@lumine', first_name: 'Lumine', daily_messages: 28, weekly_messages: 195, monthly_messages: 480, total_messages: 3420, warns: 0, status: 'active', quota_percent: 390 },
    { uid: '700000002', telegram_id: '102', username: '@venti_bard', first_name: 'Venti', daily_messages: 18, weekly_messages: 142, monthly_messages: 380, total_messages: 2890, warns: 0, status: 'active', quota_percent: 284 },
    { uid: '700000003', telegram_id: '103', username: '@raiden_ei', first_name: 'Raiden Shogun', daily_messages: 14, weekly_messages: 110, monthly_messages: 290, total_messages: 1950, warns: 0, status: 'active', quota_percent: 220 },
    { uid: '700000004', telegram_id: '104', username: '@zhongli_geo', first_name: 'Zhongli', daily_messages: 8, weekly_messages: 75, monthly_messages: 190, total_messages: 1600, warns: 0, status: 'active', quota_percent: 150 },
    { uid: '700000005', telegram_id: '105', username: '@nahida_kusanali', first_name: 'Nahida', daily_messages: 0, weekly_messages: 20, monthly_messages: 110, total_messages: 840, warns: 0, status: 'rest', rest_until: nextSunday.toISOString(), rest_reason: 'Сесія в Академії Сумеру', quota_percent: 40 },
    { uid: '700000006', telegram_id: '106', username: '@furina_de_fontaine', first_name: 'Furina', daily_messages: 3, weekly_messages: 18, monthly_messages: 65, total_messages: 420, warns: 1, status: 'warned', quota_percent: 36 }
  ];

  return {
    chat: {
      bound: true,
      min_messages: 50,
      clean_day: 0,
      clean_hour: 20,
      language: 'ua',
      total_members: 42,
      total_weekly_messages: 2540,
      resting_count: 3,
      warned_count: 2,
      max_warns: 3,
      next_clean_date: nextSunday.toISOString()
    },
    weekly_top: demoUsers,
    all_time_top: [...demoUsers].sort((a, b) => b.total_messages - a.total_messages)
  };
}

// ---------- Overview & Countdown ----------
function updateStatsOverview(chat) {
  if (!chat) return;
  const elMembers = document.getElementById('valMembers');
  const elQuota = document.getElementById('valQuota');
  const elWeekly = document.getElementById('valWeekly');
  const elResting = document.getElementById('valResting');

  if (elMembers) elMembers.textContent = chat.total_members != null ? chat.total_members.toLocaleString() : '—';
  if (elQuota) elQuota.textContent = chat.min_messages != null ? chat.min_messages : '50';
  if (elWeekly) elWeekly.textContent = chat.total_weekly_messages != null ? chat.total_weekly_messages.toLocaleString() : '—';
  if (elResting) elResting.textContent = chat.resting_count != null ? chat.resting_count : '0';
}

function startCountdown(cleanDateStr) {
  if (countdownTimer) clearInterval(countdownTimer);
  if (!cleanDateStr) return;

  const target = new Date(cleanDateStr).getTime();
  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMins = document.getElementById('cdMins');
  const elSecs = document.getElementById('cdSecs');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (elDays) elDays.textContent = '00';
      if (elHours) elHours.textContent = '00';
      if (elMins) elMins.textContent = '00';
      if (elSecs) elSecs.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (elDays) elDays.textContent = String(d).padStart(2, '0');
    if (elHours) elHours.textContent = String(h).padStart(2, '0');
    if (elMins) elMins.textContent = String(m).padStart(2, '0');
    if (elSecs) elSecs.textContent = String(s).padStart(2, '0');
  }

  tick();
  countdownTimer = setInterval(tick, 1000);
}

// ---------- Leaderboard ----------
function renderLeaderboard(filterText = '') {
  if (!chatState) return;
  const board = document.getElementById('leaderboard');
  if (!board) return;

  let list = currentTab === 'weekly' ? chatState.weekly_top : chatState.all_time_top;
  if (!list) list = [];

  const minQuota = (chatState.chat && chatState.chat.min_messages) || 50;

  if (filterText) {
    const q = filterText.toLowerCase().replace(/^@/, '');
    list = list.filter(u =>
      (u.first_name && u.first_name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().replace(/^@/, '').includes(q)) ||
      (u.uid && String(u.uid).includes(q)) ||
      (u.telegram_id && String(u.telegram_id).includes(q))
    );
  }

  if (list.length === 0) {
    board.innerHTML = `
      <li class="empty" style="padding: 28px 12px;">
        <div class="empty__icon">✦</div>
        <div class="empty__title">${escapeHtml(t('searchNotFound'))}</div>
      </li>
    `;
    return;
  }

  board.innerHTML = list.map((user, idx) => {
    const rankNum = idx + 1;
    const rankClass = rankNum === 1 ? 'board__rank--1' : (rankNum === 2 ? 'board__rank--2' : (rankNum === 3 ? 'board__rank--3' : ''));
    const initial = (user.first_name || user.username || '✦').charAt(0).toUpperCase();
    const displayName = user.first_name || user.username || 'Мандрівник';
    const subName = user.username ? user.username : `UID ${user.uid || user.telegram_id}`;
    const elem = getElementForUser(user);

    const weekly = parseInt(user.weekly_messages, 10) || 0;
    const total = parseInt(user.total_messages, 10) || 0;
    const countVal = currentTab === 'weekly' ? weekly : total;
    const subVal = currentTab === 'weekly' ? `${total} ${t('mTotal').toLowerCase()}` : `${weekly} ${t('mWeek').toLowerCase()}`;

    // Quota progress
    const pct = Math.min(100, Math.round((weekly / minQuota) * 100));
    const barClass = pct >= 100 ? 'is-done' : (pct >= 50 ? 'is-mid' : 'is-low');

    // Badge
    let badgeHtml = '';
    if (user.status === 'rest') {
      badgeHtml = `<span class="badge badge--hydro">${escapeHtml(t('statusRest'))}</span>`;
    } else if (user.warns > 0) {
      badgeHtml = `<span class="badge badge--danger">${escapeHtml(t('statusWarned'))}</span>`;
    } else if (pct >= 100) {
      badgeHtml = `<span class="badge badge--ok">${escapeHtml(t('statusActive'))}</span>`;
    } else {
      badgeHtml = `<span class="badge badge--warn">${pct}%</span>`;
    }

    const isSelected = String(user.telegram_id) === String(selectedUserId) || String(user.uid) === String(selectedUserId);

    return `
      <li class="board__row ${isSelected ? 'is-selected' : ''}" data-uid="${escapeHtml(user.telegram_id || user.uid)}" onclick="handleUserClick('${escapeHtml(user.telegram_id || user.uid)}')">
        <span class="board__rank ${rankClass}">${rankNum}</span>
        <div class="avatar avatar--${elem}">${escapeHtml(initial)}</div>
        <div class="board__who">
          <span class="board__name">${escapeHtml(displayName)}</span>
          <span class="board__sub">${escapeHtml(subName)}</span>
        </div>
        <div class="board__quota" title="${weekly} / ${minQuota}">
          <span class="progress"><span class="progress__bar ${barClass}" style="width: ${pct}%"></span></span>
          <span class="board__pct">${pct}%</span>
        </div>
        <div class="board__count">
          <strong>${countVal.toLocaleString()}</strong>
          <small>${escapeHtml(subVal)}</small>
        </div>
        ${badgeHtml}
      </li>
    `;
  }).join('');
}

window.handleUserClick = function(id) {
  const u = findUserById(id);
  if (u) {
    selectUser(u);
  }
};

function selectUser(user) {
  selectedUserId = user.telegram_id || user.uid;
  displayProfile(user);

  // Update selected class in DOM
  document.querySelectorAll('.board__row').forEach(row => {
    row.classList.toggle('is-selected', row.getAttribute('data-uid') === String(selectedUserId));
  });
}

function findUserById(id) {
  if (!chatState) return null;
  const pool = [...(chatState.weekly_top || []), ...(chatState.all_time_top || [])];
  const s = String(id).toLowerCase().replace(/^@/, '');
  return pool.find(u =>
    String(u.telegram_id) === s ||
    String(u.uid) === s ||
    (u.username && u.username.toLowerCase().replace(/^@/, '') === s)
  );
}

// ---------- Traveler Profile Passport Card ----------
function displayProfile(user) {
  const empty = document.getElementById('profileEmpty');
  const card = document.getElementById('profileCard');
  if (!card) return;

  if (empty) empty.hidden = true;
  card.hidden = false;

  const minQuota = (chatState && chatState.chat && chatState.chat.min_messages) || user.quota_min || 50;
  const maxWarns = (chatState && chatState.chat && chatState.chat.max_warns) || user.max_warns || 3;
  const elem = getElementForUser(user);
  const initial = (user.first_name || user.username || '✦').charAt(0).toUpperCase();

  // Avatar & Names
  const elAvatar = document.getElementById('pAvatar');
  if (elAvatar) {
    elAvatar.className = `avatar avatar--xl avatar--${elem}`;
    elAvatar.textContent = initial;
  }

  const elName = document.getElementById('pName');
  if (elName) elName.textContent = user.first_name || user.username || 'Мандрівник';

  const elUsername = document.getElementById('pUsername');
  if (elUsername) elUsername.textContent = user.username ? user.username : '—';

  const elUid = document.getElementById('pUid');
  if (elUid) elUid.textContent = user.uid || user.telegram_id || '—';

  // Rank
  let rankVal = user.rank;
  if (!rankVal && chatState && chatState.weekly_top) {
    const idx = chatState.weekly_top.findIndex(u => String(u.telegram_id) === String(user.telegram_id) || String(u.uid) === String(user.uid));
    if (idx >= 0) rankVal = idx + 1;
  }
  const elRank = document.getElementById('pRank');
  if (elRank) elRank.textContent = rankVal ? `#${rankVal}` : '#—';

  // Status & Warns
  const elStatus = document.getElementById('pStatus');
  if (elStatus) {
    if (user.status === 'rest') {
      elStatus.innerHTML = `<span class="badge badge--hydro">${escapeHtml(t('statusRest'))}</span>`;
    } else if (user.warns > 0) {
      elStatus.innerHTML = `<span class="badge badge--danger">${escapeHtml(t('statusWarned'))}</span>`;
    } else {
      elStatus.innerHTML = `<span class="badge badge--ok">${escapeHtml(t('statusActive'))}</span>`;
    }
  }

  const elWarns = document.getElementById('pWarns');
  if (elWarns) {
    const warns = parseInt(user.warns, 10) || 0;
    let dots = '';
    for (let i = 0; i < maxWarns; i++) {
      dots += `<i class="${i < warns ? 'is-on' : ''}"></i>`;
    }
    elWarns.className = `warn-dots ${warns >= maxWarns ? 'is-max' : ''}`;
    elWarns.innerHTML = dots;
  }

  // Quota progress
  const weekly = parseInt(user.weekly_messages, 10) || 0;
  const pct = Math.min(100, Math.round((weekly / minQuota) * 100));
  const elQuotaText = document.getElementById('pQuotaText');
  if (elQuotaText) elQuotaText.textContent = `${weekly.toLocaleString()} / ${minQuota.toLocaleString()}`;

  const elQuotaBar = document.getElementById('pQuotaBar');
  if (elQuotaBar) {
    elQuotaBar.style.width = `${pct}%`;
    elQuotaBar.className = `progress__bar ${pct >= 100 ? 'is-done' : (pct >= 50 ? 'is-mid' : 'is-low')}`;
  }

  const elQuotaHint = document.getElementById('pQuotaHint');
  if (elQuotaHint) {
    if (weekly >= minQuota) {
      elQuotaHint.textContent = t('quotaDone');
      elQuotaHint.classList.add('is-done');
    } else {
      elQuotaHint.textContent = t('quotaRemaining', { n: (minQuota - weekly).toLocaleString() });
      elQuotaHint.classList.remove('is-done');
    }
  }

  // 4 Metrics
  const elDay = document.getElementById('pDay');
  if (elDay) elDay.textContent = (user.daily_messages || 0).toLocaleString();

  const elWeek = document.getElementById('pWeek');
  if (elWeek) elWeek.textContent = weekly.toLocaleString();

  const elMonth = document.getElementById('pMonth');
  if (elMonth) elMonth.textContent = (user.monthly_messages || 0).toLocaleString();

  const elTotal = document.getElementById('pTotal');
  if (elTotal) elTotal.textContent = (user.total_messages || 0).toLocaleString();

  // Rest callout
  const elRest = document.getElementById('pRest');
  const elRestDate = document.getElementById('pRestDate');
  const elRestReason = document.getElementById('pRestReason');

  if (user.status === 'rest') {
    if (elRest) elRest.hidden = false;
    if (elRestDate) {
      elRestDate.textContent = user.rest_until ? new Date(user.rest_until).toLocaleDateString() : '—';
    }
    if (elRestReason) {
      elRestReason.textContent = user.rest_reason || '—';
    }
  } else {
    if (elRest) elRest.hidden = true;
  }
}

// ---------- Database Search (on Enter) ----------
async function executeDatabaseSearch(query) {
  const hint = document.getElementById('searchHint');
  if (!query) {
    if (hint) {
      hint.classList.remove('is-error');
      hint.textContent = t('searchHint');
    }
    return;
  }

  // 1. Try local list first
  const localMatch = findUserById(query);
  if (localMatch) {
    selectUser(localMatch);
    if (hint) {
      hint.classList.remove('is-error');
      hint.textContent = `✓ ${localMatch.first_name || localMatch.username}`;
    }
    return;
  }

  // 2. Fetch from backend API
  const isFile = window.location.protocol === 'file:';
  if (!isFile) {
    if (hint) hint.textContent = t('searchSearching');

    try {
      let url = `/api/stats?id=${encodeURIComponent(query)}`;
      if (query.startsWith('7000') || (!isNaN(Number(query)) && query.length < 10)) {
        url = `/api/stats?uid=${encodeURIComponent(query)}`;
      } else if (query.startsWith('@')) {
        url = `/api/stats?username=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          selectUser(data.user);
          if (hint) {
            hint.classList.remove('is-error');
            hint.textContent = `✓ ${data.user.first_name || data.user.username}`;
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Backend search error:', err.message);
    }
  }

  if (hint) {
    hint.classList.add('is-error');
    hint.textContent = t('searchNotFound');
  }
}

// ---------- Helpers ----------
function getElementForUser(user) {
  const idStr = String(user.telegram_id || user.uid || user.username || '1');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % ELEMENTS.length;
  return ELEMENTS[idx];
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
