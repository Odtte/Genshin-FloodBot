// === GENSHIN FLOOD ADMIN SCRIPT ===

let adminToken = sessionStorage.getItem('flood_admin_token') || '';

document.addEventListener('DOMContentLoaded', () => {
  if (adminToken) {
    showAdminPanel();
    loadAdminData();
  } else {
    showLogin();
  }

  initAdminEvents();
});

function initAdminEvents() {
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('adminPasswordInput').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('saveSettingsBtn').addEventListener('click', handleSaveSettings);
  document.getElementById('manualCleanBtn').addEventListener('click', handleManualClean);
}

function showLogin() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'inline-block';
}

async function handleLogin() {
  const pwd = document.getElementById('adminPasswordInput').value.trim();
  if (!pwd) return alert('Введіть пароль!');

  adminToken = pwd;
  sessionStorage.setItem('flood_admin_token', adminToken);

  const isFileProtocol = window.location.protocol === 'file:';

  if (isFileProtocol) {
    // Local offline preview check
    if (pwd === 'genshin_admin_secret_123' || pwd === 'admin') {
      showAdminPanel();
      loadAdminData();
      return;
    } else {
      sessionStorage.removeItem('flood_admin_token');
      adminToken = '';
      return alert('Невірний пароль! Для офлайн-перегляду введіть: genshin_admin_secret_123 або admin');
    }
  }

  try {
    const res = await fetch(`/api/admin?token=${encodeURIComponent(adminToken)}`);
    if (!res.ok) {
      sessionStorage.removeItem('flood_admin_token');
      adminToken = '';
      return alert('Невірний пароль адміністратора!');
    }
    showAdminPanel();
    loadAdminData();
  } catch (err) {
    // If backend server is not running, allow default password
    if (pwd === 'genshin_admin_secret_123' || pwd === 'admin') {
      showAdminPanel();
      loadAdminData();
    } else {
      alert('Помилка авторизації: ' + err.message);
    }
  }
}

function handleLogout() {
  sessionStorage.removeItem('flood_admin_token');
  adminToken = '';
  showLogin();
}

async function loadAdminData() {
  const isFileProtocol = window.location.protocol === 'file:';

  if (!isFileProtocol) {
    try {
      const res = await fetch(`/api/admin?token=${encodeURIComponent(adminToken)}`);
      if (res.ok) {
        const data = await res.json();
        populateSettings(data.settings);
        renderRestRequests(data.restRequests, data.settings.min_messages);
        renderUsers(data.users);
        return;
      }
    } catch (err) {
      console.warn('Backend API unavailable, using demo admin data:', err.message);
    }
  }

  // Demo admin data for local file preview
  const demoSettings = {
    min_messages: 50,
    language: 'ua',
    clean_hour: 20,
    max_warns: 3
  };

  const demoRequests = [
    {
      id: 'REQ-849102',
      username: '@nahida_kusanali',
      duration: '7d',
      weekly_msg_at_request: 20,
      reason: 'Сесія та іспити в Академії Сумеру',
      status: 'pending'
    },
    {
      id: 'REQ-632115',
      username: '@furina_de_fontaine',
      duration: '2w',
      weekly_msg_at_request: 2,
      reason: 'Репетиція в оперному театрі Епіклез',
      status: 'pending'
    },
    {
      id: 'REQ-512004',
      username: '@venti_bard',
      duration: '3d',
      weekly_msg_at_request: 85,
      reason: 'Свято вітряних квітів у Мондштадті',
      status: 'approved',
      processed_by: 'Власник'
    }
  ];

  const demoUsers = [
    { uid: '700000001', username: '@lumine', first_name: 'Lumine', telegram_id: '101', weekly_messages: 185, total_messages: 3200, warns: 0, status: 'active' },
    { uid: '700000002', username: '@venti_bard', first_name: 'Venti', telegram_id: '102', weekly_messages: 142, total_messages: 2890, warns: 0, status: 'active' },
    { uid: '700000003', username: '@raiden_ei', first_name: 'Raiden Shogun', telegram_id: '103', weekly_messages: 110, total_messages: 1950, warns: 0, status: 'active' },
    { uid: '700000004', username: '@nahida_kusanali', first_name: 'Nahida', telegram_id: '104', weekly_messages: 20, total_messages: 840, warns: 0, status: 'pending_rest' },
    { uid: '700000005', username: '@furina_de_fontaine', first_name: 'Furina', telegram_id: '105', weekly_messages: 2, total_messages: 420, warns: 1, status: 'warned' }
  ];

  populateSettings(demoSettings);
  renderRestRequests(demoRequests, demoSettings.min_messages);
  renderUsers(demoUsers);
}

function populateSettings(settings) {
  document.getElementById('settingMin').value = settings.min_messages || 50;
  document.getElementById('settingLang').value = settings.language || 'ua';
  document.getElementById('settingCleanHour').value = settings.clean_hour || 20;
  document.getElementById('settingMaxWarns').value = settings.max_warns || 3;
}

async function handleSaveSettings() {
  const min_messages = parseInt(document.getElementById('settingMin').value, 10);
  const language = document.getElementById('settingLang').value;
  const clean_hour = parseInt(document.getElementById('settingCleanHour').value, 10);
  const max_warns = parseInt(document.getElementById('settingMaxWarns').value, 10);

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
        max_warns
      })
    });

    if (!res.ok) throw new Error('Помилка збереження');
    alert('✅ Налаштування успішно збережено!');
    loadAdminData();
  } catch (err) {
    alert('Помилка: ' + err.message);
  }
}

function renderRestRequests(requests, minQuota) {
  const tbody = document.getElementById('restRequestsBody');
  if (!requests || requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1.5rem;">Заявок на рест немає.</td></tr>`;
    return;
  }

  tbody.innerHTML = requests.map(req => {
    const count = parseInt(req.weekly_msg_at_request, 10) || 0;
    const isSuspicious = count < (minQuota * 0.3) && req.status === 'pending';

    let actionButtons = '—';
    if (req.status === 'pending') {
      actionButtons = `
        <button class="btn-action btn-approve" onclick="decideRest('${req.id}', 'approved')">Схвалити</button>
        <button class="btn-action btn-reject" onclick="decideRest('${req.id}', 'rejected')">Відхилити</button>
      `;
    } else {
      actionButtons = `<span style="font-size: 0.8rem; color: var(--text-dim);">${req.status} (${req.processed_by || 'Admin'})</span>`;
    }

    return `
      <tr>
        <td><code>${req.id}</code></td>
        <td><strong>${escapeHtml(req.username)}</strong></td>
        <td>${req.duration}</td>
        <td>
          ${count} пов.
          ${isSuspicious ? '<span class="badge-suspicious">⚠️ Підозріло</span>' : ''}
        </td>
        <td style="max-width: 250px;">${escapeHtml(req.reason)}</td>
        <td>
          <span class="status-badge ${req.status === 'approved' ? 'badge-active' : (req.status === 'pending' ? 'badge-rest' : 'badge-warned')}">
            ${req.status}
          </span>
        </td>
        <td>${actionButtons}</td>
      </tr>
    `;
  }).join('');
}

async function decideRest(requestId, decision) {
  if (!confirm(`Ви дійсно хочете ${decision === 'approved' ? 'схвалити' : 'відхилити'} цей рест?`)) {
    return;
  }

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

    if (!res.ok) throw new Error('Помилка обробки ресту');
    loadAdminData();
  } catch (err) {
    alert('Помилка: ' + err.message);
  }
}

async function handleManualClean() {
  if (!confirm('⚠️ УВАГА! Ви дійсно бажаєте запустити позачергову чистку прямо зараз?\nВсі учасники без норми та ресту отримають варни або будуть кікнуті!')) {
    return;
  }

  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify({ action: 'trigger_clean' })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Помилка чистки');

    alert(`🎉 Чистку успішно завершено!\nВиконали норму: ${data.report.safe}\nУ ресті: ${data.report.resting}\nВарнів: ${data.report.warned}\nКікнуто: ${data.report.kicked}`);
    loadAdminData();
  } catch (err) {
    alert('Помилка: ' + err.message);
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('allUsersBody');
  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1.5rem;">Немає учасників.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    return `
      <tr>
        <td><code>${u.uid}</code></td>
        <td>${escapeHtml(u.username || u.first_name)}</td>
        <td><strong>${u.weekly_messages}</strong></td>
        <td>${u.total_messages}</td>
        <td>${u.warns}/3</td>
        <td><span class="status-badge ${u.status === 'active' ? 'badge-active' : (u.status === 'rest' ? 'badge-rest' : 'badge-warned')}">${u.status}</span></td>
        <td>
          <button class="btn-action btn-approve" style="padding: 0.2rem 0.5rem;" onclick="resetUserWarns('${u.telegram_id}')">Скинути варни</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function resetUserWarns(telegramId) {
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

    if (!res.ok) throw new Error('Помилка оновлення');
    loadAdminData();
  } catch (err) {
    alert('Помилка: ' + err.message);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
