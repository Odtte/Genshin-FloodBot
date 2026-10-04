import { getAllUsers, getSettings, getUser, getUserByUid } from '../src/db/sheets.js';

export default async function handler(req, res) {
  // Set CORS headers for web dashboard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const settings = await getSettings();
    const minMessages = parseInt(settings.min_messages, 10) || 50;
    const allUsers = await getAllUsers();

    const { id, uid, username } = req.query;

    // Specific user lookup
    if (id || uid || username) {
      let targetUser = null;
      if (id) {
        targetUser = allUsers.find(u => String(u.telegram_id) === String(id));
      } else if (uid) {
        targetUser = allUsers.find(u => String(u.uid) === String(uid));
      } else if (username) {
        const cleanName = username.replace(/^@/, '').toLowerCase();
        targetUser = allUsers.find(u => (u.username || '').replace(/^@/, '').toLowerCase() === cleanName);
      }

      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Sort leaderboard to find user rank
      const activeSorted = [...allUsers]
        .filter(u => u.status !== 'kicked')
        .sort((a, b) => (parseInt(b.weekly_messages, 10) || 0) - (parseInt(a.weekly_messages, 10) || 0));

      const rankIndex = activeSorted.findIndex(u => String(u.telegram_id) === String(targetUser.telegram_id));
      const weekly = parseInt(targetUser.weekly_messages, 10) || 0;
      const percent = Math.min(100, Math.round((weekly / minMessages) * 100));

      const now = new Date();
      const isResting = targetUser.rest_until && new Date(targetUser.rest_until) > now;

      return res.status(200).json({
        user: {
          uid: targetUser.uid,
          telegram_id: targetUser.telegram_id,
          username: targetUser.username,
          first_name: targetUser.first_name,
          daily_messages: parseInt(targetUser.daily_messages, 10) || 0,
          weekly_messages: weekly,
          monthly_messages: parseInt(targetUser.monthly_messages, 10) || 0,
          total_messages: parseInt(targetUser.total_messages, 10) || 0,
          warns: parseInt(targetUser.warns, 10) || 0,
          max_warns: parseInt(settings.max_warns, 10) || 3,
          status: isResting ? 'rest' : targetUser.status,
          rest_until: targetUser.rest_until,
          rest_reason: targetUser.rest_reason,
          quota_percent: percent,
          rank: rankIndex >= 0 ? rankIndex + 1 : null,
          quota_min: minMessages
        }
      });
    }

    // General Chat Statistics & Leaderboard
    const now = new Date();
    let totalWeeklyMessages = 0;
    let restingCount = 0;
    let warnedCount = 0;

    const sanitizedUsers = allUsers
      .filter(u => u.status !== 'kicked')
      .map(u => {
        const daily = parseInt(u.daily_messages, 10) || 0;
        const weekly = parseInt(u.weekly_messages, 10) || 0;
        const monthly = parseInt(u.monthly_messages, 10) || 0;
        const total = parseInt(u.total_messages, 10) || 0;
        const warns = parseInt(u.warns, 10) || 0;
        const isRest = u.rest_until && new Date(u.rest_until) > now;

        totalWeeklyMessages += weekly;
        if (isRest) restingCount++;
        if (warns > 0) warnedCount++;

        return {
          uid: u.uid,
          telegram_id: u.telegram_id,
          username: u.username,
          first_name: u.first_name,
          daily_messages: daily,
          weekly_messages: weekly,
          monthly_messages: monthly,
          total_messages: total,
          warns,
          status: isRest ? 'rest' : u.status,
          rest_until: u.rest_until,
          rest_reason: u.rest_reason,
          quota_percent: Math.min(100, Math.round((weekly / minMessages) * 100))
        };
      });

    // Leaderboards
    const weeklyTop = [...sanitizedUsers]
      .sort((a, b) => b.weekly_messages - a.weekly_messages);

    const allTimeTop = [...sanitizedUsers]
      .sort((a, b) => b.total_messages - a.total_messages);

    // Calculate next Sunday clean time
    const nextClean = new Date();
    nextClean.setUTCDate(nextClean.getUTCDate() + ((7 - nextClean.getUTCDay()) % 7 || 7));
    nextClean.setUTCHours(17, 0, 0, 0); // 17:00 UTC = 20:00 GMT+3

    return res.status(200).json({
      chat: {
        bound: Boolean(settings.chat_id),
        min_messages: minMessages,
        clean_day: settings.clean_day,
        clean_hour: settings.clean_hour,
        language: settings.language || 'ua',
        total_members: sanitizedUsers.length,
        total_weekly_messages: totalWeeklyMessages,
        resting_count: restingCount,
        warned_count: warnedCount,
        next_clean_date: nextClean.toISOString()
      },
      weekly_top: weeklyTop.slice(0, 50),
      all_time_top: allTimeTop.slice(0, 50)
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ error: err.message });
  }
}
