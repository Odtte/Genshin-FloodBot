// === GENSHIN FLOOD DASHBOARD APP ===

const i18n = {
  ua: {
    headerSubtitle: "Система Чисток & Рестів",
    navAdminText: "Адмін",
    heroTitle: "Флуд Геншин Імпакт",
    heroDesc: "Відстежуйте свою щотижневу норму спілкування, статус імунітету від чисток та рести.",
    countdownLabel: "⏳ До недільної чистки:",
    lblDays: "Днів",
    lblHours: "Год",
    lblMins: "Хв",
    lblSecs: "Сек",
    statMembersLbl: "Учасників флуду",
    statMembersSub: "Активні мандрівники",
    statQuotaLbl: "Тижнева норма",
    statQuotaSub: "Мінімум для імунітету",
    statWeeklyLbl: "Повідомлень за тиждень",
    statWeeklySub: "Загальний флуд",
    statRestLbl: "На ресті (відпустка)",
    statRestSub: "Мають імунітет",
    searchPlaceholder: "Введіть свій UID, @username або ID...",
    searchBtn: "Знайти картку",
    cardQuotaLabel: "Прогрес щотижневої норми",
    cardDailyLbl: "☀️ Сьогодні",
    cardWeeklyLbl: "📅 Цей тиждень",
    cardMonthlyLbl: "🌙 Цей місяць",
    cardTotalLbl: "🏆 За весь час",
    cardWarnsLbl: "Попередження (варни)",
    cardStatusLbl: "Статус",
    boardTitle: "Таблиця лідерів флуду",
    tabWeekly: "Цей тиждень",
    tabAllTime: "За весь час",
    thUser: "Користувач",
    thWeekly: "Цього тижня",
    thTotal: "Загалом",
    thQuota: "Виконання",
    thStatus: "Статус",
    statusActive: "В строю",
    statusRest: "На ресті",
    statusWarned: "Під загрозою",
    rankPrefix: "Ранг #",
    notFound: "Користувача не знайдено!"
  },
  eng: {
    headerSubtitle: "Cleanup & Rest System",
    navAdminText: "Admin",
    heroTitle: "Genshin Impact Flood",
    heroDesc: "Track your weekly chat activity quota, cleanup immunity status, and rests.",
    countdownLabel: "⏳ Until Sunday Cleanup:",
    lblDays: "Days",
    lblHours: "Hours",
    lblMins: "Mins",
    lblSecs: "Secs",
    statMembersLbl: "Flood Members",
    statMembersSub: "Active travelers",
    statQuotaLbl: "Weekly Quota",
    statQuotaSub: "Required for immunity",
    statWeeklyLbl: "Weekly Messages",
    statWeeklySub: "Total chat activity",
    statRestLbl: "On Rest (Vacation)",
    statRestSub: "Have immunity",
    searchPlaceholder: "Enter your UID, @username or ID...",
    searchBtn: "Find Card",
    cardQuotaLabel: "Weekly Quota Progress",
    cardDailyLbl: "☀️ Today",
    cardWeeklyLbl: "📅 This Week",
    cardMonthlyLbl: "🌙 This Month",
    cardTotalLbl: "🏆 All Time",
    cardWarnsLbl: "Warnings (Warns)",
    cardStatusLbl: "Status",
    boardTitle: "Flood Leaderboard",
    tabWeekly: "This Week",
    tabAllTime: "All Time",
    thUser: "User",
    thWeekly: "This Week",
    thTotal: "Total",
    thQuota: "Quota Met",
    thStatus: "Status",
    statusActive: "Active",
    statusRest: "On Rest",
    statusWarned: "At Risk",
    rankPrefix: "Rank #",
    notFound: "User not found!"
  },
  ru: {
    headerSubtitle: "Система Чисток & Рестов",
    navAdminText: "Админ",
    heroTitle: "Флуд Геншин Импакт",
    heroDesc: "Отслеживайте свою еженедельную норму общения, статус иммунитета от чисток и ресты.",
    countdownLabel: "⏳ До воскресной чистки:",
    lblDays: "Дней",
    lblHours: "Час",
    lblMins: "Мин",
    lblSecs: "Сек",
    statMembersLbl: "Участников флуда",
    statMembersSub: "Активные путешественники",
    statQuotaLbl: "Недельная норма",
    statQuotaSub: "Минимум для иммунитета",
    statWeeklyLbl: "Сообщений за неделю",
    statWeeklySub: "Общий актив",
    statRestLbl: "На ресте (отпуск)",
    statRestSub: "Имеют иммунитет",
    searchPlaceholder: "Введите свой UID, @username или ID...",
    searchBtn: "Найти карточку",
    cardQuotaLabel: "Прогресс недельной нормы",
    cardDailyLbl: "☀️ Сегодня",
    cardWeeklyLbl: "📅 Эта неделя",
    cardMonthlyLbl: "🌙 Этот месяц",
    cardTotalLbl: "🏆 Всё время",
    cardWarnsLbl: "Предупреждения (варны)",
    cardStatusLbl: "Статус",
    boardTitle: "Таблица лидеров флуда",
    tabWeekly: "Эта неделя",
    tabAllTime: "За всё время",
    thUser: "Пользователь",
    thWeekly: "За неделю",
    thTotal: "Всего",
    thQuota: "Выполнение",
    thStatus: "Статус",
    statusActive: "В строю",
    statusRest: "На ресте",
    statusWarned: "Под угрозой",
    rankPrefix: "Ранг #",
    notFound: "Пользователь не найден!"
  }
};

let currentLang = 'ua';
let chatData = null;
let currentTab = 'weekly';
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initEventListeners();
  loadStats();
});

function initLanguage() {
  const savedLang = localStorage.getItem('flood_lang') || 'ua';
  setLanguage(savedLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
}

function setLanguage(lang) {
  if (!i18n[lang]) return;
  currentLang = lang;
  localStorage.setItem('flood_lang', lang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  const texts = i18n[lang];
  for (const [id, val] of Object.entries(texts)) {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === 'INPUT') {
        el.placeholder = val;
      } else {
        el.innerText = val;
      }
    }
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = texts.searchPlaceholder;
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) searchBtn.innerText = texts.searchBtn;

  if (chatData) {
    renderLeaderboard();
  }
}

function initEventListeners() {
  document.getElementById('tabWeekly').addEventListener('click', () => {
    currentTab = 'weekly';
    document.getElementById('tabWeekly').classList.add('active');
    document.getElementById('tabAllTime').classList.remove('active');
    renderLeaderboard();
  });

  document.getElementById('tabAllTime').addEventListener('click', () => {
    currentTab = 'alltime';
    document.getElementById('tabAllTime').classList.add('active');
    document.getElementById('tabWeekly').classList.remove('active');
    renderLeaderboard();
  });

  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    chatData = await res.json();

    updateOverview(chatData.chat);
    startCountdown(chatData.chat.next_clean_date);
    renderLeaderboard();

    // Check URL parameters for direct user lookup (?id=... or ?uid=...)
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id') || urlParams.get('uid');
    if (targetId) {
      document.getElementById('searchInput').value = targetId;
      fetchUserProfile(targetId);
    }
  } catch (err) {
    console.error('Error loading data:', err);
    document.getElementById('leaderboardBody').innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--accent-red); padding: 2rem;">
          Помилка підключення до бази даних. Спробуйте пізніше.
        </td>
      </tr>
    `;
  }
}

function updateOverview(chat) {
  document.getElementById('valTotalMembers').innerText = chat.total_members || 0;
  document.getElementById('valMinMessages').innerText = `${chat.min_messages} пов.`;
  document.getElementById('valWeeklyTotal').innerText = chat.total_weekly_messages || 0;
  document.getElementById('valResting').innerText = chat.resting_count || 0;
}

function startCountdown(cleanDateStr) {
  if (countdownInterval) clearInterval(countdownInterval);

  const targetDate = new Date(cleanDateStr).getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById('cdDays').innerText = '00';
      document.getElementById('cdHours').innerText = '00';
      document.getElementById('cdMinutes').innerText = '00';
      document.getElementById('cdSeconds').innerText = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cdDays').innerText = String(days).padStart(2, '0');
    document.getElementById('cdHours').innerText = String(hours).padStart(2, '0');
    document.getElementById('cdMinutes').innerText = String(mins).padStart(2, '0');
    document.getElementById('cdSeconds').innerText = String(secs).padStart(2, '0');
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

function renderLeaderboard() {
  if (!chatData) return;
  const list = currentTab === 'weekly' ? chatData.weekly_top : chatData.all_time_top;
  const tbody = document.getElementById('leaderboardBody');
  const texts = i18n[currentLang];

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Поки що немає даних.</td></tr>`;
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  tbody.innerHTML = list.map((user, index) => {
    const rank = medals[index] || (index + 1);
    const initial = (user.first_name || user.username || '?')[0].toUpperCase();
    const displayName = user.first_name || user.username || 'Мандрівник';
    const usernameTag = user.username ? user.username : `UID: ${user.uid}`;
    
    // Status text
    let badgeClass = 'badge-active';
    let statusLabel = texts.statusActive;

    if (user.status === 'rest') {
      badgeClass = 'badge-rest';
      statusLabel = texts.statusRest;
    } else if (user.warns > 0) {
      badgeClass = 'badge-warned';
      statusLabel = `${texts.statusWarned} (${user.warns}/3)`;
    }

    const percent = user.quota_percent || 0;

    return `
      <tr onclick="fetchUserProfile('${user.telegram_id}')">
        <td class="rank-cell">${rank}</td>
        <td>
          <div class="user-cell">
            <div class="user-avatar-small">${initial}</div>
            <div class="user-details">
              <div class="uname">${escapeHtml(displayName)}</div>
              <div class="uuid">${escapeHtml(usernameTag)}</div>
            </div>
          </div>
        </td>
        <td><strong>${user.weekly_messages}</strong></td>
        <td>${user.total_messages}</td>
        <td>
          <span style="font-weight: 600; color: ${percent >= 100 ? 'var(--anemo)' : 'var(--accent-gold)'};">
            ${percent}%
          </span>
        </td>
        <td>
          <span class="status-badge ${badgeClass}">${statusLabel}</span>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;
  await fetchUserProfile(query);
}

async function fetchUserProfile(query) {
  try {
    let url = `/api/stats?id=${encodeURIComponent(query)}`;
    if (query.startsWith('7000') || !isNaN(Number(query)) && query.length < 10) {
      url = `/api/stats?uid=${encodeURIComponent(query)}`;
    } else if (query.startsWith('@')) {
      url = `/api/stats?username=${encodeURIComponent(query)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      alert(i18n[currentLang].notFound);
      return;
    }

    const data = await res.json();
    displayProfileCard(data.user);
  } catch (err) {
    console.error('Error fetching user card:', err);
  }
}

function displayProfileCard(user) {
  const texts = i18n[currentLang];
  const wrapper = document.getElementById('profileWrapper');
  wrapper.style.display = 'block';

  const initial = (user.first_name || user.username || '✦')[0].toUpperCase();
  document.getElementById('cardAvatar').innerText = initial;
  document.getElementById('cardName').innerText = user.first_name || user.username || 'Мандрівник';
  document.getElementById('cardUid').innerText = `UID: ${user.uid} (${user.username || ''})`;
  document.getElementById('cardRank').innerText = `${texts.rankPrefix}${user.rank || '—'}`;

  // Quota
  const min = user.quota_min || 50;
  const weekly = user.weekly_messages || 0;
  const percent = user.quota_percent || 0;
  document.getElementById('cardQuotaCount').innerText = `${weekly} / ${min} (${percent}%)`;
  
  const fill = document.getElementById('cardProgressFill');
  fill.style.width = `${Math.min(100, percent)}%`;
  if (percent < 50) {
    fill.classList.add('warning');
  } else {
    fill.classList.remove('warning');
  }

  // 4 Timeframe Metrics
  document.getElementById('cardDailyVal').innerText = user.daily_messages || 0;
  document.getElementById('cardWeeklyVal').innerText = user.weekly_messages || 0;
  document.getElementById('cardMonthlyVal').innerText = user.monthly_messages || 0;
  document.getElementById('cardTotalVal').innerText = user.total_messages || 0;
  document.getElementById('cardWarnsVal').innerText = `${user.warns || 0} / ${user.max_warns || 3}`;

  // Status
  const statusContainer = document.getElementById('cardStatusVal');
  const restDetails = document.getElementById('cardRestDetails');

  if (user.status === 'rest') {
    statusContainer.innerHTML = `<span class="status-badge badge-rest">${texts.statusRest}</span>`;
    restDetails.style.display = 'block';
    const dateFormatted = user.rest_until ? new Date(user.rest_until).toLocaleDateString() : '—';
    document.getElementById('cardRestDate').innerText = dateFormatted;
    document.getElementById('cardRestReason').innerText = user.rest_reason || '—';
  } else if (user.warns > 0) {
    statusContainer.innerHTML = `<span class="status-badge badge-warned">${texts.statusWarned}</span>`;
    restDetails.style.display = 'none';
  } else {
    statusContainer.innerHTML = `<span class="status-badge badge-active">${texts.statusActive}</span>`;
    restDetails.style.display = 'none';
  }

  // Smooth scroll up to card
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
