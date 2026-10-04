import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Telegram Bot Token from @BotFather
  botToken: process.env.BOT_TOKEN || '',

  // Vercel deployment URL (e.g. https://your-project.vercel.app)
  appUrl: process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : '',

  // Google Sheets integration
  sheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  // Security & Admin
  adminSecret: process.env.ADMIN_SECRET || 'genshin_admin_secret_123',
  cronSecret: process.env.CRON_SECRET || '',

  // Defaults if not set in DB
  defaults: {
    language: 'ua',
    minMessages: 50,
    cleanDay: 0, // 0 = Sunday
    cleanHour: 20, // 20:00 (GMT+3)
    maxWarns: 3,
    cleanAction: 'warn', // 'warn' or 'kick'
  }
};
