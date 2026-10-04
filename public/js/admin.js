// =========================================================
// Genshin Flood Admin — Management Client Script
// =========================================================

let adminToken = sessionStorage.getItem('flood_admin_token') || '';
let currentTab = 'requests';
let restFilter = 'pending';
let adminDataCache = null;

const ELEMENTS = ['anemo', 'geo', 'electro', 'dendro', 'hydro', 'pyro', 'cryo'];

document.addEventListener('DOMContentLoaded', () => {
  initEvents();

  if (adminToken) {
    showAdminPanel();
    loadAdminData();
  } else {
    showLogin();
  }
});

function initEvents() {
  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);

  const pwdInput = document.getElementById('adminPasswordInput');
  if (pwdInput) {
    pwdInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  // Logout & Refresh
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const refreshBtn = document.getElementById('refreshDataBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => loadAdminData(true));

  // Tabs
  document.querySelectorAll('.tabs__btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Rest filter buttons
  document.querySelectorAll('[data-filter-rest]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-rest]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      restFilter = btn.getAttribute('data-filter-rest');
      if (adminDataCache) {
        renderRestRequests(adminDataCache.restRequests, (adminDataCache.settings && adminDataCache.settings.min_messages) || 50);
      }
    });
  });

  // Users search
  const userSearch = document.getElementById('userSearchInput');
  if (userSearch) {
    userSearch.addEventListener('input', () => {
      if (adminDataCache) {
        renderUsers(adminDataCache.users, userSearch.value.trim());
      }
    });
  }

  // Settings save
  const saveBtn = document.getElementById('saveSettingsBtn');
  if (saveBtn) saveBtn.addEventListener('click', handleSaveSettings);

  // Manual cleanup
  const cleanBtn = document.getElementById('manualCleanBtn');
  if (cleanBtn) cleanBtn.addEventListener('click', handleManualClean);
}

// ---------- View Toggling ----------
function showLogin() {
  const loginSection = document.getElementById('loginSection');
  const adminPanel = document.getElementById('adminPanel');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginSection) loginSection.hidden = false;
  if (adminPanel) adminPanel.hidden = true;
  if (logoutBtn) logoutBtn.hidden = true;

  const pwdInput = document.getElementById('adminPasswordInput');
  if (pwdInput) {
    pwdInput.value = '';
    pwdInput.focus();
  }
}

function showAdminPanel() {
  const loginSection = document.getElementById('loginSection');
  const adminPanel = document.getElementById('adminPanel');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginSection) loginSection.hidden = true;
  if (adminPanel) adminPanel.hidden = false;
  if (logoutBtn) logoutBtn.hidden = false;
}

function switchTab(tabName) {
  currentTab = tabName;

  document.querySelectorAll('.tabs__btn[data-tab]').forEach(btn => {
    btn.classList.toggle('is-active', btn.getAttribute('data-tab') === tabName);
  });

  const paneMap = {
    requests: 'tabContentRequests',
    settings: 'tabContentSettings',
    users: 'tabContentUsers',
    cleanup: 'tabContentCleanup'
  };

  Object.entries(paneMap).forEach(([key, id]) => {
    const pane = document.getElementById(id);
    if (pane) {
      pane.hidden = key !== tabName;
    }
  });
}

// ---------- Authentication ----------
async function handleLogin() {
  const pwdInput = document.getElementById('adminPasswordInput');
  const errEl = document.getElementById('loginError');
  const pwd = pwdInput ? pwdInput.value.trim() : '';

  if (!pwd) {
    if (errEl) {
      errEl.textContent = 'Будь ласка, введіть пароль!';
      errEl.hidden = false;
    }
    return;
  }

  if (errEl) errEl.hidden = true;
  const isFile = window.location.protocol === 'file:';

  if (isFile) {
    if (pwd === 'genshin_admin_secret_123' || pwd === 'admin') {
      adminToken = pwd;
      sessionStorage.setItem('flood_admin_token', adminToken);
      showAdminPanel();
      loadAdminData();
      showToast('Вхід успішний (офлайн демо)', 'ok');
      return;
    } else {
      if (errEl) {
        errEl.textContent = 'Невірний пароль! Для офлайн-демо введіть: genshin_admin_secret_123 або admin';
        errEl.hidden = false;
      }
      return;
    }
  }

  try {
    const res = await fetch(`/api/admin?token=${encodeURIComponent(pwd)}`);
    if (!res.ok) {
      if (errEl) {
        errEl.textContent = 'Невірний пароль адміністратора!';
        errEl.hidden = false;
      }
      return;
    }

    adminToken = pwd;
    sessionStorage.setItem('flood_admin_token', adminToken);
    showAdminPanel();
    loadAdminData();
    showToast('Вітаємо в адмін-панелі Тейвату!', 'ok');
  } catch (err) {
    // If local dev server offline or API error, fallback for demo testing
    if (pwd === 'genshin_admin_secret_123' || pwd === 'admin') {
      adminToken = pwd;
      sessionStorage.setItem('flood_admin_token', adminToken);
      showAdminPanel();
      loadAdminData();
      showToast('Вхід виконано у режимі попереднього перегляду', 'ok');
    } else {
      if (errEl) {
        errEl.textContent = 'Помилка з\'єднання із сервером: ' + err.message;
        errEl.hidden = false;
      }
    }
  }
}

function handleLogout() {
  sessionStorage.removeItem('flood_admin_token');
  adminToken = '';
  adminDataCache = null;
  showLogin();
  showToast('Сесію завершено', 'ok');
}

// ---------- Data Loading ----------
async function loadAdminData(showToastNotification = false) {
  const isFile = window.location.protocol === 'file:';

  if (!isFile) {
    try {
      const res = await fetch(`/api/admin?token=${encodeURIComponent(adminToken)}`);
      if (res.ok) {
        const data = await res.json();
        adminDataCache = data;
        applyAdminData(data);
        if (showToastNotification) showToast('Дані успішно оновлено', 'ok');
        return;
      } else if (res.status === 401) {
        handleLogout();
        return;
      }
    } catch (err) {
      console.warn('API fetch error, using local demo admin data:', err.message);
    }
  }

  // Demo Fallback
  adminDataCache = generateDemoAdminData();
  applyAdminData(adminDataCache);
  if (showToastNotification) showToast('Дані оновлено (демо-режим)', 'ok');
}

function applyAdminData(data) {
  // 1. Password warning
  const warnBanner = document.getElementById('defaultPasswordWarning');
  if (warnBanner) {
    warnBanner.hidden = !(data.settings && data.settings.is_default_password);
  }

  // 2. Settings
  populateSettings(data.settings || {});

  // 3. Rest requests
  const minQuota = (data.settings && data.settings.min_messages) || 50;
  renderRestRequests(data.restRequests || [], minQuota);

  // 4. Users
  const searchVal = document.getElementById('userSearchInput')?.value.trim() || '';
  renderUsers(data.users || [], searchVal);

  // 5. Badges
  const pendingCount = (data.restRequests || []).filter(r => r.status === 'pending').length;
  const pBadge = document.getElementById('pendingBadge');
  if (pBadge) {
    pBadge.textContent = pendingCount;
    pBadge.setAttribute('data-zero', pendingCount === 0 ? 'true' : 'false');
  }

  const uBadge = document.getElementById('usersCountBadge');
  if (uBadge) {
    uBadge.textContent = (data.users || []).length;
  }
}

function generateDemoAdminData() {
  return {
    settings: {
      min_messages: 50,
      language: 'ua',
      clean_hour: 20,
      clean_action: 'warn_and_kick',
      max_warns: 3,
      is_default_password: true
    },
    restRequests: [
      {
        id: 'REQ-849102',
        username: '@nahida_kusanali',
        first_name: 'Nahida',
        telegram_id: '105',
        duration: '7d',
        weekly_msg_at_request: 20,
        reason: 'Сесія та складання іспитів в Академії Сумеру',
        status: 'pending'
      },
      {
        id: 'REQ-632115',
        username: '@furina_de_fontaine',
        first_name: 'Furina',
        telegram_id: '106',
        duration: '14d',
        weekly_msg_at_request: 2,
        reason: 'Репетиція в оперному театрі Епіклез перед судом',
        status: 'pending'
      },
      {
        id: 'REQ-512004',
        username: '@venti_bard',
        first_name: 'Venti',
        telegram_id: '102',
        duration: '3d',
        weekly_msg_at_request: 85,
        reason: 'Свято вітряних квітів у Мондштадті, дегустація сидру',
        status: 'approved',
        processed_by: 'Власник'
      }
    ],
    users: [
      { uid: '700000001', username: '@lumine', first_name: 'Lumine', telegram_id: '101', weekly_messages: 195, total_messages: 3420, warns: 0, status: 'active' },
      { uid: '700000002', username: '@venti_bard', first_name: 'Venti', telegram_id: '102', weekly_messages: 142, total_messages: 2890, warns: 0, status: 'active' },
      { uid: '700000003', username: '@raiden_ei', first_name: 'Raiden Shogun', telegram_id: '103', weekly_messages: 110, total_messages: 1950, warns: 0, status: 'active' },
      { uid: '700000004', username: '@zhongli_geo', first_name: 'Zhongli', telegram_id: '104', weekly_messages: 75, total_messages: 1600, warns: 0, status: 'active' },
      { uid: '700000005', username: '@nahida_kusanali', first_name: 'Nahida', telegram_id: '105', weekly_messages: 20, total_messages: 840, warns: 0, status: 'pending_rest' },
      { uid: '700000006', username: '@furina_de_fontaine', first_name: 'Furina', telegram_id: '106', weekly_messages: 2, total_messages: 420, warns: 1, status: 'warned' }
    ]
  };
}

// ---------- Rest Requests Rendering ----------
function renderRestRequests(requests, minQuota) {
  const container = document.getElementById('restRequestsList');
  if (!container) return;

  let list = requests || [];
  if (restFilter === 'pending') {
    list = list.filter(r => r.status === 'pending');
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty" style="grid-column: 1 / -1; padding: 36px 16px;">
        <div class="empty__icon">✨</div>
        <div class="empty__title">Немає заявок на розгляд</div>
        <div class="empty__text">Усі запити опрацьовано або нових поки що не надходило.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(req => {
    const count = parseInt(req.weekly_msg_at_request, 10) || 0;
    const isSuspicious = count < (minQuota * 0.3) && req.status === 'pending';
    const elem = getElementForUser(req);
    const initial = (req.first_name || req.username || '✦').charAt(0).toUpperCase();
    const displayName = req.first_name || req.username || 'Мандрівник';
    const subName = req.username ? req.username : `ID: ${req.telegram_id || req.id}`;

    let actionsHtml = '';
    if (req.status === 'pending') {
      actionsHtml = `
        <div class="rest-card__actions">
          <button type="button" class="btn btn--success btn--sm" onclick="decideRest('${escapeHtml(req.id)}', 'approved')">
            <span>✓ Схвалити</span>
          </button>
          <button type="button" class="btn btn--danger-ghost btn--sm" onclick="decideRest('${escapeHtml(req.id)}', 'rejected')">
            <span>✕ Відхилити</span>
          </button>
        </div>
      `;
    } else {
      const isApproved = req.status === 'approved';
      actionsHtml = `
        <div class="rest-card__done">
          <span class="badge ${isApproved ? 'badge--ok' : 'badge--danger'}">
            ${isApproved ? 'Схвалено' : 'Відхилено'} (${escapeHtml(req.processed_by || 'Admin')})
          </span>
        </div>
      `;
    }

    return `
      <article class="rest-card ${isSuspicious ? 'is-suspicious' : ''}">
        <div class="rest-card__head">
          <div class="avatar avatar--${elem}">${escapeHtml(initial)}</div>
          <div class="rest-card__who">
            <div class="rest-card__name">${escapeHtml(displayName)}</div>
            <div class="rest-card__meta">${escapeHtml(subName)} · <code>${escapeHtml(req.id)}</code></div>
          </div>
          ${isSuspicious ? '<span class="badge badge--danger" title="Мало повідомлень перед самою чисткою!">⚠️ Підозріло</span>' : ''}
        </div>

        <div class="rest-card__facts">
          <div class="fact">
            <span class="fact__label">Термін ресту</span>
            <span class="fact__value">⏳ ${escapeHtml(req.duration)}</span>
          </div>
          <div class="fact">
            <span class="fact__label">Актив на запиті</span>
            <span class="fact__value">${count} пов. <small class="muted">/ ${minQuota}</small></span>
          </div>
        </div>

        <div class="rest-card__reason">
          <strong>Причина:</strong> ${escapeHtml(req.reason)}
        </div>

        ${actionsHtml}
      </article>
    `;
  }).join('');
}

window.decideRest = async function(requestId, decision) {
  const isApprove = decision === 'approved';
  const confirmed = await showConfirmModal(
    isApprove ? 'Схвалення ресту' : 'Відхилення ресту',
    `Ви впевнені, що бажаєте ${isApprove ? 'схвалити' : 'відхилити'} заявку ${requestId}?${isApprove ? '\nУчасник отримає імунітет від чисток на вказаний період.' : ''}`,
    isApprove ? 'Схвалити' : 'Відхилити',
    !isApprove
  );

  if (!confirmed) return;

  const isFile = window.location.protocol === 'file:';
  if (!isFile) {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          action: 'rest_decision',
          requestId,
          decision
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Помилка обробки запиту');
      }

      showToast(`Заявку ${requestId} успішно ${isApprove ? 'схвалено' : 'відхилено'}!`, 'ok');
      loadAdminData();
      return;
    } catch (err) {
      showToast(`Помилка: ${err.message}`, 'error');
    }
  }

  // Local demo simulation
  if (adminDataCache && adminDataCache.restRequests) {
    const target = adminDataCache.restRequests.find(r => r.id === requestId);
    if (target) {
      target.status = decision;
      target.processed_by = 'Власник (демо)';
    }
    applyAdminData(adminDataCache);
    showToast(`(Демо) Заявку ${requestId} ${isApprove ? 'схвалено' : 'відхилено'}`, 'ok');
  }
};

// ---------- Settings ----------
function populateSettings(settings) {
  const elMin = document.getElementById('settingMin');
  const elLang = document.getElementById('settingLang');
  const elHour = document.getElementById('settingCleanHour');
  const elAction = document.getElementById('settingCleanAction');
  const elWarns = document.getElementById('settingMaxWarns');

  if (elMin) elMin.value = settings.min_messages || 50;
  if (elLang) elLang.value = settings.language || 'ua';
  if (elHour) elHour.value = settings.clean_hour !== undefined ? settings.clean_hour : 20;
  if (elAction) elAction.value = settings.clean_action || 'warn_and_kick';
  if (elWarns) elWarns.value = settings.max_warns || 3;
}

async function handleSaveSettings() {
  const min_messages = parseInt(document.getElementById('settingMin')?.value, 10) || 50;
  const language = document.getElementById('settingLang')?.value || 'ua';
  const clean_hour = parseInt(document.getElementById('settingCleanHour')?.value, 10) || 20;
  const clean_action = document.getElementById('settingCleanAction')?.value || 'warn_and_kick';
  const max_warns = parseInt(document.getElementById('settingMaxWarns')?.value, 10) || 3;

  const isFile = window.location.protocol === 'file:';
  if (!isFile) {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          action: 'update_settings',
          min_messages,
          language,
          clean_hour,
          clean_action,
          max_warns
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Помилка збереження');
      }

      showToast('Налаштування успішно збережено в Google Sheets!', 'ok');
      loadAdminData();
      return;
    } catch (err) {
      showToast(`Помилка: ${err.message}`, 'error');
    }
  }

  // Demo simulation
  if (adminDataCache) {
    adminDataCache.settings = {
      ...adminDataCache.settings,
      min_messages,
      language,
      clean_hour,
      clean_action,
      max_warns
    };
    showToast('(Демо) Налаштування оновлено', 'ok');
    applyAdminData(adminDataCache);
  }
}

// ---------- Users List ----------
function renderUsers(users, filterText = '') {
  const tbody = document.getElementById('allUsersBody');
  if (!tbody) return;

  let list = users || [];
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
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--muted);">Учасників не знайдено.</td></tr>`;
    return;
  }

  const maxWarns = (adminDataCache?.settings?.max_warns) || 3;

  tbody.innerHTML = list.map(u => {
    const elem = getElementForUser(u);
    const initial = (u.first_name || u.username || '✦').charAt(0).toUpperCase();
    const displayName = u.first_name || u.username || 'Мандрівник';
    const subName = u.username || '—';
    const weekly = parseInt(u.weekly_messages, 10) || 0;
    const total = parseInt(u.total_messages, 10) || 0;
    const warns = parseInt(u.warns, 10) || 0;

    // Status badge
    let statusBadge = '';
    if (u.status === 'rest') {
      statusBadge = '<span class="badge badge--hydro">На ресті</span>';
    } else if (warns > 0) {
      statusBadge = `<span class="badge badge--danger">${warns}/${maxWarns} варнів</span>`;
    } else {
      statusBadge = '<span class="badge badge--ok">В строю</span>';
    }

    return `
      <tr>
        <td>
          <div class="cell-user">
            <div class="avatar avatar--sm avatar--${elem}">${escapeHtml(initial)}</div>
            <div>
              <div class="cell-user__name">${escapeHtml(displayName)}</div>
              <div class="cell-user__sub">${escapeHtml(subName)}</div>
            </div>
          </div>
        </td>
        <td><code class="mono">${escapeHtml(u.uid || u.telegram_id)}</code></td>
        <td class="num"><strong>${weekly.toLocaleString()}</strong></td>
        <td class="num">${total.toLocaleString()}</td>
        <td>
          <span class="warn-dots ${warns >= maxWarns ? 'is-max' : ''}">
            ${Array.from({ length: maxWarns }).map((_, i) => `<i class="${i < warns ? 'is-on' : ''}"></i>`).join('')}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td class="actions">
          <button type="button" class="btn btn--ghost btn--xs" onclick="resetUserWarns('${escapeHtml(u.telegram_id)}')">
            Скинути варни
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.resetUserWarns = async function(telegramId) {
  const confirmed = await showConfirmModal(
    'Скидання покарань',
    `Скинути всі попередження (варни) для користувача ID ${telegramId}?`,
    'Скинути',
    false
  );
  if (!confirmed) return;

  const isFile = window.location.protocol === 'file:';
  if (!isFile) {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          action: 'user_action',
          telegramId,
          warns: 0,
          status: 'active'
        })
      });

      if (!res.ok) throw new Error('Помилка сервера');
      showToast('Варни учасника скинуто до 0!', 'ok');
      loadAdminData();
      return;
    } catch (err) {
      showToast(`Помилка: ${err.message}`, 'error');
    }
  }

  // Demo simulation
  if (adminDataCache && adminDataCache.users) {
    const u = adminDataCache.users.find(x => String(x.telegram_id) === String(telegramId));
    if (u) {
      u.warns = 0;
      u.status = 'active';
    }
    applyAdminData(adminDataCache);
    showToast('(Демо) Варни скинуто до 0', 'ok');
  }
};

// ---------- Manual Cleanup ----------
async function handleManualClean() {
  const confirmed = await showConfirmModal(
    '⚠️ УВАГА! Позачергова чистка',
    'Ви дійсно бажаєте запустити позачергову чистку прямо зараз?\n\nВсі учасники без норми і без ресту отримають варни або будуть виключені з чату, а тижневі лічильники скинуться!',
    'Так, запустити чистку',
    true
  );

  if (!confirmed) return;

  const isFile = window.location.protocol === 'file:';
  if (!isFile) {
    try {
      showToast('Запуск алгоритму чистки…', 'ok');
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ action: 'trigger_clean' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Помилка виконання чистки');

      showToast('Чистку успішно завершено!', 'ok');
      displayCleanReport(data.report || {});
      loadAdminData();
      return;
    } catch (err) {
      showToast(`Помилка чистки: ${err.message}`, 'error');
    }
  }

  // Demo simulation
  const mockReport = {
    totalChecked: adminDataCache?.users?.length || 6,
    safe: 4,
    resting: 1,
    warned: 1,
    kicked: 0
  };
  showToast('(Демо) Чистку успішно змодельовано', 'ok');
  displayCleanReport(mockReport);
}

function displayCleanReport(report) {
  const resultCard = document.getElementById('cleanReportResult');
  const body = document.getElementById('cleanReportBody');
  if (!resultCard || !body) return;

  resultCard.hidden = false;
  body.innerHTML = `
    <ul style="list-style:none; padding:4px 0; margin-top:6px; display:grid; gap:4px; font-size:13.5px;">
      <li>🛡️ Виконали норму: <strong>${report.safe ?? '—'}</strong></li>
      <li>🏖️ На ресті (імунітет): <strong>${report.resting ?? '—'}</strong></li>
      <li>⚠️ Отримали варни: <strong>${report.warned ?? '—'}</strong></li>
      <li>🚫 Кікнуто з чату: <strong>${report.kicked ?? '—'}</strong></li>
    </ul>
  `;
}

// ---------- Confirmation Modal Promise ----------
function showConfirmModal(title, text, confirmText = 'Підтвердити', isDanger = false) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('modalTitle');
    const textEl = document.getElementById('modalText');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const backdrop = document.getElementById('modalBackdrop');

    if (!modal || !confirmBtn || !cancelBtn) {
      resolve(confirm(text));
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    confirmBtn.textContent = confirmText;
    confirmBtn.className = isDanger ? 'btn btn--danger btn--sm' : 'btn btn--primary btn--sm';

    modal.hidden = false;

    function cleanup() {
      modal.hidden = true;
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      if (backdrop) backdrop.removeEventListener('click', onCancel);
    }

    function onConfirm() {
      cleanup();
      resolve(true);
    }

    function onCancel() {
      cleanup();
      resolve(false);
    }

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    if (backdrop) backdrop.addEventListener('click', onCancel);
  });
}

// ---------- Toast Notifications ----------
function showToast(message, type = 'ok') {
  const container = document.getElementById('toasts');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type === 'error' ? 'error' : 'ok'}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : '✦'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-leaving');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 260);
  }, 3600);
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
