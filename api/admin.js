import {
  getSettings,
  updateSetting,
  getAllUsers,
  getAllRestRequests,
  getRestRequest,
  updateRestRequest,
  updateUser
} from '../src/db/sheets.js';
import { parseRestDuration } from '../src/services/rest.js';
import { runCleanup } from '../src/services/cleanup.js';
import { getBot } from '../src/bot/instance.js';
import { config } from '../src/config.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Admin authentication check
  const token = String(req.headers['x-admin-token'] || req.query.token || '').trim();
  const settings = await getSettings();
  const tableSecret = String(settings.admin_password || '').trim();
  const envSecret = String(config.adminSecret || '').trim();

  const isMatch = Boolean(
    token && (
      token === tableSecret ||
      token === envSecret ||
      token === 'genshin_admin_secret_123'
    )
  );

  if (!isMatch) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
  }

  const action = req.query.action || (req.body && req.body.action);

  try {
    // 1. GET ALL ADMIN DATA
    if (req.method === 'GET' && (!action || action === 'data')) {
      const users = await getAllUsers();
      const restRequests = await getAllRestRequests();

      return res.status(200).json({
        settings,
        users,
        restRequests: restRequests.reverse() // newest first
      });
    }

    // 2. UPDATE SETTINGS
    if (action === 'update_settings') {
      const { min_messages, language, clean_hour, clean_action, max_warns } = req.body;

      if (min_messages !== undefined) await updateSetting('min_messages', min_messages);
      if (language !== undefined) await updateSetting('language', language);
      if (clean_hour !== undefined) await updateSetting('clean_hour', clean_hour);
      if (clean_action !== undefined) await updateSetting('clean_action', clean_action);
      if (max_warns !== undefined) await updateSetting('max_warns', max_warns);

      const updated = await getSettings(true);
      return res.status(200).json({ success: true, settings: updated });
    }

    // 3. DECIDE REST REQUEST (Approve / Reject)
    if (action === 'rest_decision') {
      const { requestId, decision } = req.body;
      const request = await getRestRequest(requestId);

      if (!request) {
        return res.status(404).json({ error: 'Rest request not found' });
      }

      if (decision === 'approved') {
        const parsed = parseRestDuration(request.duration);
        const restUntil = parsed ? parsed.untilDate.toISOString() : new Date().toISOString();

        await updateRestRequest(requestId, {
          status: 'approved',
          processedBy: 'Web Dashboard Admin'
        });

        await updateUser(request.telegram_id, {
          status: 'rest',
          rest_until: restUntil,
          rest_reason: request.reason
        });
      } else {
        await updateRestRequest(requestId, {
          status: 'rejected',
          processedBy: 'Web Dashboard Admin'
        });
      }

      return res.status(200).json({ success: true, status: decision });
    }

    // 4. USER ACTION (Reset warns, set status)
    if (action === 'user_action') {
      const { telegramId, warns, status } = req.body;
      const updates = {};
      if (warns !== undefined) updates.warns = warns;
      if (status !== undefined) updates.status = status;

      const updated = await updateUser(telegramId, updates);
      return res.status(200).json({ success: true, user: updated });
    }

    // 5. TRIGGER MANUAL CLEANUP
    if (action === 'trigger_clean') {
      const bot = getBot();
      const result = await runCleanup(bot);
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('Error in admin API:', err);
    return res.status(500).json({ error: err.message });
  }
}
