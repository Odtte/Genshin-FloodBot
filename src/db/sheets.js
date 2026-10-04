import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { config } from '../config.js';

let docInstance = null;
let sheetsCache = null;
let settingsCache = null;
let lastSettingsFetch = 0;

/**
 * Check if Google Sheets credentials are provided in env
 */
export function isSheetsConfigured() {
  return Boolean(
    config.sheets.spreadsheetId &&
    config.sheets.clientEmail &&
    config.sheets.privateKey &&
    !config.sheets.spreadsheetId.includes('<ID>')
  );
}

// In-Memory Storage for Local Development / Testing without Google Cloud keys
let localSettings = {
  chat_id: '',
  owner_id: '',
  language: config.defaults.language,
  min_messages: config.defaults.minMessages,
  clean_day: config.defaults.cleanDay,
  clean_hour: config.defaults.cleanHour,
  clean_action: config.defaults.cleanAction,
  max_warns: config.defaults.maxWarns,
  admin_password: config.adminSecret
};

let localUsers = [
  {
    uid: '700000001',
    telegram_id: '101',
    username: '@lumine',
    first_name: 'Lumine',
    daily_messages: '25',
    weekly_messages: '185',
    monthly_messages: '450',
    total_messages: '3200',
    warns: '0',
    status: 'active',
    rest_until: '',
    rest_reason: '',
    last_daily_date: new Date().toISOString().slice(0, 10),
    last_monthly_date: new Date().toISOString().slice(0, 7),
    last_active: new Date().toISOString()
  },
  {
    uid: '700000002',
    telegram_id: '102',
    username: '@venti_bard',
    first_name: 'Venti',
    daily_messages: '18',
    weekly_messages: '142',
    monthly_messages: '380',
    total_messages: '2890',
    warns: '0',
    status: 'active',
    rest_until: '',
    rest_reason: '',
    last_daily_date: new Date().toISOString().slice(0, 10),
    last_monthly_date: new Date().toISOString().slice(0, 7),
    last_active: new Date().toISOString()
  },
  {
    uid: '700000003',
    telegram_id: '103',
    username: '@raiden_ei',
    first_name: 'Raiden Shogun',
    daily_messages: '14',
    weekly_messages: '110',
    monthly_messages: '290',
    total_messages: '1950',
    warns: '0',
    status: 'active',
    rest_until: '',
    rest_reason: '',
    last_daily_date: new Date().toISOString().slice(0, 10),
    last_monthly_date: new Date().toISOString().slice(0, 7),
    last_active: new Date().toISOString()
  },
  {
    uid: '700000004',
    telegram_id: '104',
    username: '@nahida_kusanali',
    first_name: 'Nahida',
    daily_messages: '0',
    weekly_messages: '20',
    monthly_messages: '110',
    total_messages: '840',
    warns: '0',
    status: 'rest',
    rest_until: new Date(Date.now() + 86400000 * 5).toISOString(),
    rest_reason: 'Сесія в Академії',
    last_daily_date: new Date().toISOString().slice(0, 10),
    last_monthly_date: new Date().toISOString().slice(0, 7),
    last_active: new Date().toISOString()
  },
  {
    uid: '700000005',
    telegram_id: '105',
    username: '@furina_de_fontaine',
    first_name: 'Furina',
    daily_messages: '2',
    weekly_messages: '2',
    monthly_messages: '65',
    total_messages: '420',
    warns: '1',
    status: 'warned',
    rest_until: '',
    rest_reason: '',
    last_daily_date: new Date().toISOString().slice(0, 10),
    last_monthly_date: new Date().toISOString().slice(0, 7),
    last_active: new Date().toISOString()
  }
];

let localRestRequests = [
  {
    id: 'REQ-632115',
    telegram_id: '105',
    username: '@furina_de_fontaine',
    duration: '2w',
    reason: 'Репетиція в театрі Епіклез',
    status: 'pending',
    weekly_msg_at_request: '2',
    created_at: new Date().toISOString(),
    processed_at: '',
    processed_by: ''
  },
  {
    id: 'REQ-849102',
    telegram_id: '104',
    username: '@nahida_kusanali',
    duration: '5d',
    reason: 'Сесія в Академії',
    status: 'approved',
    weekly_msg_at_request: '20',
    created_at: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    processed_by: 'Admin'
  }
];

/**
 * Initialize and load Google Spreadsheet
 */
export async function getDoc() {
  if (docInstance) return docInstance;

  if (!isSheetsConfigured()) {
    return null;
  }

  const serviceAccountAuth = new JWT({
    email: config.sheets.clientEmail,
    key: config.sheets.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(config.sheets.spreadsheetId, serviceAccountAuth);
  await doc.loadInfo();
  docInstance = doc;

  await ensureSheets(doc);
  return doc;
}

/**
 * Ensures all required sheets and headers exist
 */
async function ensureSheets(doc) {
  // 1. Users sheet
  let usersSheet = doc.sheetsByTitle['Users'];
  if (!usersSheet) {
    usersSheet = await doc.addSheet({
      title: 'Users',
      headerValues: [
        'uid',
        'telegram_id',
        'username',
        'first_name',
        'daily_messages',
        'weekly_messages',
        'monthly_messages',
        'total_messages',
        'warns',
        'status',
        'rest_until',
        'rest_reason',
        'last_daily_date',
        'last_monthly_date',
        'last_active'
      ]
    });
  }

  // 2. Settings sheet
  let settingsSheet = doc.sheetsByTitle['Settings'];
  if (!settingsSheet) {
    settingsSheet = await doc.addSheet({
      title: 'Settings',
      headerValues: ['key', 'value']
    });

    await settingsSheet.addRows([
      { key: 'chat_id', value: '' },
      { key: 'owner_id', value: '' },
      { key: 'language', value: config.defaults.language },
      { key: 'min_messages', value: String(config.defaults.minMessages) },
      { key: 'clean_day', value: String(config.defaults.cleanDay) },
      { key: 'clean_hour', value: String(config.defaults.cleanHour) },
      { key: 'clean_action', value: config.defaults.cleanAction },
      { key: 'max_warns', value: String(config.defaults.maxWarns) },
      { key: 'admin_password', value: config.adminSecret }
    ]);
  }

  // 3. RestRequests sheet
  let restSheet = doc.sheetsByTitle['RestRequests'];
  if (!restSheet) {
    restSheet = await doc.addSheet({
      title: 'RestRequests',
      headerValues: [
        'id',
        'telegram_id',
        'username',
        'duration',
        'reason',
        'status',
        'weekly_msg_at_request',
        'created_at',
        'processed_at',
        'processed_by'
      ]
    });
  }

  sheetsCache = {
    users: usersSheet,
    settings: settingsSheet,
    rest: restSheet
  };
}

/**
 * Get sheet objects
 */
async function getSheets() {
  if (!isSheetsConfigured()) return null;
  if (!sheetsCache) {
    await getDoc();
  }
  return sheetsCache;
}

/**
 * Load settings as key-value object
 */
export async function getSettings(forceRefresh = false) {
  if (!isSheetsConfigured()) {
    return { ...localSettings };
  }

  const now = Date.now();
  if (!forceRefresh && settingsCache && (now - lastSettingsFetch < 30000)) {
    return settingsCache;
  }

  try {
    const sheets = await getSheets();
    if (!sheets) return { ...localSettings };

    const rows = await sheets.settings.getRows();
    const result = { ...localSettings };

    for (const row of rows) {
      const key = row.get('key');
      const val = row.get('value');
      if (key) {
        if (['min_messages', 'clean_day', 'clean_hour', 'max_warns'].includes(key)) {
          result[key] = parseInt(val, 10) || result[key];
        } else {
          result[key] = val || result[key];
        }
      }
    }

    settingsCache = result;
    lastSettingsFetch = now;
    return result;
  } catch (err) {
    console.warn('Error reading settings from Google Sheets, using local:', err.message);
    return { ...localSettings };
  }
}

/**
 * Update single setting key
 */
export async function updateSetting(key, value) {
  localSettings[key] = ['min_messages', 'clean_day', 'clean_hour', 'max_warns'].includes(key)
    ? parseInt(value, 10)
    : String(value);

  if (settingsCache) {
    settingsCache[key] = localSettings[key];
  }

  if (!isSheetsConfigured()) return;

  try {
    const sheets = await getSheets();
    if (!sheets) return;

    const rows = await sheets.settings.getRows();
    let found = false;

    for (const row of rows) {
      if (row.get('key') === key) {
        row.set('value', String(value));
        await row.save();
        found = true;
        break;
      }
    }

    if (!found) {
      await sheets.settings.addRow({ key, value: String(value) });
    }
  } catch (err) {
    console.error('Error saving setting to Sheets:', err.message);
  }
}

/**
 * Get user by Telegram ID
 */
export async function getUser(telegramId) {
  const idStr = String(telegramId);
  if (!isSheetsConfigured()) {
    return localUsers.find(u => String(u.telegram_id) === idStr) || null;
  }

  try {
    const sheets = await getSheets();
    const rows = await sheets.users.getRows();
    const row = rows.find(r => String(r.get('telegram_id')) === idStr);
    return row ? rowToObject(row) : null;
  } catch (err) {
    return localUsers.find(u => String(u.telegram_id) === idStr) || null;
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid) {
  const uidStr = String(uid);
  if (!isSheetsConfigured()) {
    return localUsers.find(u => String(u.uid) === uidStr) || null;
  }

  try {
    const sheets = await getSheets();
    const rows = await sheets.users.getRows();
    const row = rows.find(r => String(r.get('uid')) === uidStr);
    return row ? rowToObject(row) : null;
  } catch (err) {
    return localUsers.find(u => String(u.uid) === uidStr) || null;
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  if (!isSheetsConfigured()) {
    return [...localUsers];
  }

  try {
    const sheets = await getSheets();
    const rows = await sheets.users.getRows();
    return rows.map(rowToObject);
  } catch (err) {
    return [...localUsers];
  }
}

/**
 * Get or create user
 */
export async function getOrCreateUser(tgUser) {
  const idStr = String(tgUser.id);
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStr = new Date().toISOString().slice(0, 7);

  if (!isSheetsConfigured()) {
    let u = localUsers.find(x => String(x.telegram_id) === idStr);
    if (!u) {
      const newUid = 700000001 + localUsers.length;
      u = {
        uid: String(newUid),
        telegram_id: idStr,
        username: tgUser.username ? `@${tgUser.username}` : '',
        first_name: tgUser.first_name || '',
        daily_messages: '0',
        weekly_messages: '0',
        monthly_messages: '0',
        total_messages: '0',
        warns: '0',
        status: 'active',
        rest_until: '',
        rest_reason: '',
        last_daily_date: todayStr,
        last_monthly_date: monthStr,
        last_active: new Date().toISOString()
      };
      localUsers.push(u);
    }
    return u;
  }

  try {
    const sheets = await getSheets();
    const rows = await sheets.users.getRows();
    let row = rows.find(r => String(r.get('telegram_id')) === idStr);

    if (row) {
      return rowToObject(row);
    }

    const startUid = 700000001;
    const newUid = startUid + rows.length;

    const newUserObj = {
      uid: String(newUid),
      telegram_id: idStr,
      username: tgUser.username ? `@${tgUser.username}` : '',
      first_name: tgUser.first_name || '',
      daily_messages: '0',
      weekly_messages: '0',
      monthly_messages: '0',
      total_messages: '0',
      warns: '0',
      status: 'active',
      rest_until: '',
      rest_reason: '',
      last_daily_date: todayStr,
      last_monthly_date: monthStr,
      last_active: new Date().toISOString()
    };

    const newRow = await sheets.users.addRow(newUserObj);
    return rowToObject(newRow);
  } catch (err) {
    console.error('Error creating user in Sheets:', err.message);
    return null;
  }
}

/**
 * Increment user's message counters
 */
export async function incrementUserMessage(tgUser) {
  const idStr = String(tgUser.id);
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStr = new Date().toISOString().slice(0, 7);

  if (!isSheetsConfigured()) {
    let u = localUsers.find(x => String(x.telegram_id) === idStr);
    if (!u) {
      u = await getOrCreateUser(tgUser);
    }
    if (u) {
      let daily = parseInt(u.daily_messages, 10) || 0;
      if (u.last_daily_date !== todayStr) {
        daily = 1;
        u.last_daily_date = todayStr;
      } else {
        daily += 1;
      }

      let monthly = parseInt(u.monthly_messages, 10) || 0;
      if (u.last_monthly_date !== monthStr) {
        monthly = 1;
        u.last_monthly_date = monthStr;
      } else {
        monthly += 1;
      }

      u.daily_messages = String(daily);
      u.monthly_messages = String(monthly);
      u.weekly_messages = String((parseInt(u.weekly_messages, 10) || 0) + 1);
      u.total_messages = String((parseInt(u.total_messages, 10) || 0) + 1);
      u.last_active = new Date().toISOString();
      return u;
    }
    return null;
  }

  try {
    const sheets = await getSheets();
    const rows = await sheets.users.getRows();
    let row = rows.find(r => String(r.get('telegram_id')) === idStr);

    if (!row) {
      await getOrCreateUser(tgUser);
      const updatedRows = await sheets.users.getRows();
      row = updatedRows.find(r => String(r.get('telegram_id')) === idStr);
    }

    if (row) {
      let daily = parseInt(row.get('daily_messages'), 10) || 0;
      if (row.get('last_daily_date') !== todayStr) {
        daily = 1;
        row.set('last_daily_date', todayStr);
      } else {
        daily += 1;
      }

      let monthly = parseInt(row.get('monthly_messages'), 10) || 0;
      if (row.get('last_monthly_date') !== monthStr) {
        monthly = 1;
        row.set('last_monthly_date', monthStr);
      } else {
        monthly += 1;
      }

      const weekly = (parseInt(row.get('weekly_messages'), 10) || 0) + 1;
      const total = (parseInt(row.get('total_messages'), 10) || 0) + 1;

      row.set('daily_messages', String(daily));
      row.set('weekly_messages', String(weekly));
      row.set('monthly_messages', String(monthly));
      row.set('total_messages', String(total));
      row.set('last_active', new Date().toISOString());

      await row.save();
      return rowToObject(row);
    }
  } catch (err) {
    console.error('Error incrementing message in Sheets:', err.message);
  }

  return null;
}

/**
 * Update user fields by telegramId
 */
export async function updateUser(telegramId, updates) {
  const idStr = String(telegramId);

  // Update in local store
  const localU = localUsers.find(u => String(u.telegram_id) === idStr);
  if (localU) {
    for (const [k, v] of Object.entries(updates)) {
      localU[k] = String(v);
    }
  }

  if (!isSheetsConfigured()) return localU;

  try {
    const sheets = await getSheets();
    const rows = await sheets.users.getRows();
    const row = rows.find(r => String(r.get('telegram_id')) === idStr);
    if (!row) return null;

    for (const [key, val] of Object.entries(updates)) {
      row.set(key, val !== null && val !== undefined ? String(val) : '');
    }

    await row.save();
    return rowToObject(row);
  } catch (err) {
    console.error('Error updating user in Sheets:', err.message);
    return localU;
  }
}

/**
 * Reset weekly messages for all active members
 */
export async function resetWeeklyMessages() {
  for (const u of localUsers) {
    if (u.status !== 'kicked') u.weekly_messages = '0';
  }

  if (!isSheetsConfigured()) return;

  try {
    const sheets = await getSheets();
    const rows = await sheets.users.getRows();

    for (const row of rows) {
      if (row.get('status') !== 'kicked') {
        row.set('weekly_messages', '0');
      }
    }
    await Promise.all(rows.map(r => r.save()));
  } catch (err) {
    console.error('Error resetting weekly messages in Sheets:', err.message);
  }
}

/**
 * Create a new Rest request
 */
export async function createRestRequest({ telegramId, username, duration, reason, weeklyMsgAtRequest }) {
  const id = `REQ-${Date.now().toString().slice(-6)}`;
  const reqObj = {
    id,
    telegram_id: String(telegramId),
    username: username || '',
    duration,
    reason: reason || '',
    status: 'pending',
    weekly_msg_at_request: String(weeklyMsgAtRequest || 0),
    created_at: new Date().toISOString(),
    processed_at: '',
    processed_by: ''
  };

  localRestRequests.push(reqObj);

  if (!isSheetsConfigured()) return reqObj;

  try {
    const sheets = await getSheets();
    const newRow = await sheets.rest.addRow(reqObj);
    return rowToObject(newRow);
  } catch (err) {
    console.error('Error creating rest request in Sheets:', err.message);
    return reqObj;
  }
}

/**
 * Get rest request by ID
 */
export async function getRestRequest(requestId) {
  const found = localRestRequests.find(r => r.id === requestId);
  if (!isSheetsConfigured()) return found || null;

  try {
    const sheets = await getSheets();
    const rows = await sheets.rest.getRows();
    const row = rows.find(r => r.get('id') === requestId);
    return row ? rowToObject(row) : (found || null);
  } catch (err) {
    return found || null;
  }
}

/**
 * Get all rest requests
 */
export async function getAllRestRequests() {
  if (!isSheetsConfigured()) return [...localRestRequests];

  try {
    const sheets = await getSheets();
    const rows = await sheets.rest.getRows();
    return rows.map(rowToObject);
  } catch (err) {
    return [...localRestRequests];
  }
}

/**
 * Update rest request status (approved/rejected)
 */
export async function updateRestRequest(requestId, { status, processedBy }) {
  const reqLocal = localRestRequests.find(r => r.id === requestId);
  if (reqLocal) {
    reqLocal.status = status;
    reqLocal.processed_at = new Date().toISOString();
    reqLocal.processed_by = processedBy || '';
  }

  if (!isSheetsConfigured()) return reqLocal;

  try {
    const sheets = await getSheets();
    const rows = await sheets.rest.getRows();
    const row = rows.find(r => r.get('id') === requestId);
    if (!row) return reqLocal;

    row.set('status', status);
    row.set('processed_at', new Date().toISOString());
    row.set('processed_by', processedBy || '');
    await row.save();
    return rowToObject(row);
  } catch (err) {
    return reqLocal;
  }
}

/**
 * Convert Google Spreadsheet row to standard JavaScript object
 */
function rowToObject(row) {
  const obj = {};
  const rawObj = row.toObject ? row.toObject() : row;
  for (const [k, v] of Object.entries(rawObj)) {
    obj[k] = v;
  }

  if (obj.uid && obj.telegram_id) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const monthStr = new Date().toISOString().slice(0, 7);

    if (obj.last_daily_date !== todayStr) {
      obj.daily_messages = '0';
    }
    if (obj.last_monthly_date !== monthStr) {
      obj.monthly_messages = '0';
    }
  }

  return obj;
}
