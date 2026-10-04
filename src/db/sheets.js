import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { config } from '../config.js';

let docInstance = null;
let sheetsCache = null;
let settingsCache = null;
let lastSettingsFetch = 0;

/**
 * Initialize and load Google Spreadsheet
 */
export async function getDoc() {
  if (docInstance) return docInstance;

  if (!config.sheets.spreadsheetId || !config.sheets.clientEmail || !config.sheets.privateKey) {
    throw new Error('Google Sheets credentials are not configured in environment variables.');
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
        'weekly_messages',
        'total_messages',
        'warns',
        'status',
        'rest_until',
        'rest_reason',
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

    // Populate default settings
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
  if (!sheetsCache) {
    await getDoc();
  }
  return sheetsCache;
}

/**
 * Load settings as key-value object (with 30s in-memory cache)
 */
export async function getSettings(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && settingsCache && (now - lastSettingsFetch < 30000)) {
    return settingsCache;
  }

  const { settings } = await getSheets();
  const rows = await settings.getRows();
  const result = {
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
}

/**
 * Update single setting key
 */
export async function updateSetting(key, value) {
  const { settings } = await getSheets();
  const rows = await settings.getRows();
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
    await settings.addRow({ key, value: String(value) });
  }

  if (settingsCache) {
    settingsCache[key] = ['min_messages', 'clean_day', 'clean_hour', 'max_warns'].includes(key)
      ? parseInt(value, 10)
      : String(value);
  }
}

/**
 * Get user by Telegram ID
 */
export async function getUser(telegramId) {
  const { users } = await getSheets();
  const rows = await users.getRows();
  const idStr = String(telegramId);

  const row = rows.find(r => String(r.get('telegram_id')) === idStr);
  if (!row) return null;

  return rowToObject(row);
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid) {
  const { users } = await getSheets();
  const rows = await users.getRows();
  const uidStr = String(uid);

  const row = rows.find(r => String(r.get('uid')) === uidStr);
  if (!row) return null;

  return rowToObject(row);
}

/**
 * Get all users
 */
export async function getAllUsers() {
  const { users } = await getSheets();
  const rows = await users.getRows();
  return rows.map(rowToObject);
}

/**
 * Get or create user with generated Genshin-style UID (700000001+)
 */
export async function getOrCreateUser(tgUser) {
  const { users } = await getSheets();
  const rows = await users.getRows();
  const idStr = String(tgUser.id);

  let row = rows.find(r => String(r.get('telegram_id')) === idStr);

  if (row) {
    // Update username/first_name if changed
    let updated = false;
    const newUsername = tgUser.username ? `@${tgUser.username}` : '';
    const newFirstName = tgUser.first_name || '';

    if (row.get('username') !== newUsername) {
      row.set('username', newUsername);
      updated = true;
    }
    if (row.get('first_name') !== newFirstName) {
      row.set('first_name', newFirstName);
      updated = true;
    }
    if (updated) {
      await row.save();
    }
    return rowToObject(row);
  }

  // Generate new UID
  const startUid = 700000001;
  const newUid = startUid + rows.length;

  const newUserObj = {
    uid: String(newUid),
    telegram_id: idStr,
    username: tgUser.username ? `@${tgUser.username}` : '',
    first_name: tgUser.first_name || '',
    weekly_messages: '0',
    total_messages: '0',
    warns: '0',
    status: 'active',
    rest_until: '',
    rest_reason: '',
    last_active: new Date().toISOString()
  };

  const newRow = await users.addRow(newUserObj);
  return rowToObject(newRow);
}

/**
 * Increment user's message counters
 */
export async function incrementUserMessage(tgUser) {
  const { users } = await getSheets();
  const rows = await users.getRows();
  const idStr = String(tgUser.id);

  let row = rows.find(r => String(r.get('telegram_id')) === idStr);

  if (!row) {
    const user = await getOrCreateUser(tgUser);
    // Refresh rows to get the row handle
    const updatedRows = await users.getRows();
    row = updatedRows.find(r => String(r.get('telegram_id')) === idStr);
  }

  if (row) {
    const weekly = (parseInt(row.get('weekly_messages'), 10) || 0) + 1;
    const total = (parseInt(row.get('total_messages'), 10) || 0) + 1;
    
    // Check if rest expired
    const restUntil = row.get('rest_until');
    let currentStatus = row.get('status') || 'active';
    if (restUntil && new Date(restUntil) <= new Date()) {
      currentStatus = 'active';
      row.set('rest_until', '');
      row.set('rest_reason', '');
    }

    row.set('weekly_messages', String(weekly));
    row.set('total_messages', String(total));
    row.set('status', currentStatus);
    row.set('last_active', new Date().toISOString());

    if (tgUser.username && row.get('username') !== `@${tgUser.username}`) {
      row.set('username', `@${tgUser.username}`);
    }
    if (tgUser.first_name && row.get('first_name') !== tgUser.first_name) {
      row.set('first_name', tgUser.first_name);
    }

    await row.save();
    return rowToObject(row);
  }

  return null;
}

/**
 * Update user fields by telegramId
 */
export async function updateUser(telegramId, updates) {
  const { users } = await getSheets();
  const rows = await users.getRows();
  const idStr = String(telegramId);

  const row = rows.find(r => String(r.get('telegram_id')) === idStr);
  if (!row) return null;

  for (const [key, val] of Object.entries(updates)) {
    row.set(key, val !== null && val !== undefined ? String(val) : '');
  }

  await row.save();
  return rowToObject(row);
}

/**
 * Reset weekly messages for all active members
 */
export async function resetWeeklyMessages() {
  const { users } = await getSheets();
  const rows = await users.getRows();

  for (const row of rows) {
    if (row.get('status') !== 'kicked') {
      row.set('weekly_messages', '0');
    }
  }

  // Save all rows
  await Promise.all(rows.map(r => r.save()));
}

/**
 * Create a new Rest request
 */
export async function createRestRequest({ telegramId, username, duration, reason, weeklyMsgAtRequest }) {
  const { rest } = await getSheets();
  const id = `REQ-${Date.now().toString().slice(-6)}`;

  const newRow = await rest.addRow({
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
  });

  return rowToObject(newRow);
}

/**
 * Get rest request by ID
 */
export async function getRestRequest(requestId) {
  const { rest } = await getSheets();
  const rows = await rest.getRows();
  const row = rows.find(r => r.get('id') === requestId);
  return row ? rowToObject(row) : null;
}

/**
 * Get all rest requests
 */
export async function getAllRestRequests() {
  const { rest } = await getSheets();
  const rows = await rest.getRows();
  return rows.map(rowToObject);
}

/**
 * Update rest request status (approved/rejected)
 */
export async function updateRestRequest(requestId, { status, processedBy }) {
  const { rest } = await getSheets();
  const rows = await rest.getRows();
  const row = rows.find(r => r.get('id') === requestId);

  if (!row) return null;

  row.set('status', status);
  row.set('processed_at', new Date().toISOString());
  row.set('processed_by', processedBy || '');
  await row.save();

  return rowToObject(row);
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
  return obj;
}
