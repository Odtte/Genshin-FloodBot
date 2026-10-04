import { Resvg } from '@resvg/resvg-js';

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate SVG markup for Genshin Traveler Card
 * @param {Object} data - User stats and metadata
 * @returns {string} SVG code
 */
export function generateCardSvg(data) {
  const {
    name = 'Traveler',
    username = '',
    uid = '700000001',
    daily = 0,
    weekly = 0,
    monthly = 0,
    total = 0,
    quotaMin = 50,
    quotaPercent = 0,
    warns = 0,
    maxWarns = 3,
    status = 'active',
    restUntil = '',
    rank = 1
  } = data;

  const initial = escapeXml((name || username || '✦')[0]?.toUpperCase() || '✦');
  const safeName = escapeXml(name.length > 20 ? name.slice(0, 19) + '…' : name);
  const safeUsername = escapeXml(username || '');
  const safeUid = escapeXml(String(uid));

  // Status badge logic
  let statusBadgeText = 'В СТРОЮ';
  let statusBadgeColor = '#10b981'; // Green
  let statusBadgeBg = 'rgba(16, 185, 129, 0.15)';

  if (status === 'rest') {
    statusBadgeText = 'НА РЕСТІ';
    statusBadgeColor = '#38bdf8'; // Blue Hydro
    statusBadgeBg = 'rgba(56, 189, 248, 0.15)';
  } else if (warns > 0) {
    statusBadgeText = `ВАРНИ: ${warns}/${maxWarns}`;
    statusBadgeColor = '#f59e0b'; // Amber
    statusBadgeBg = 'rgba(245, 158, 11, 0.15)';
  }

  // Quota progress calculation (clamped to 100% for bar, width max 730px)
  const barPercentClamped = Math.min(100, Math.max(0, quotaPercent));
  const barWidth = Math.round((barPercentClamped / 100) * 730);
  const barColor = quotaPercent >= 100 ? '#48e5c2' : '#f59e0b';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 490" width="850" height="490">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c101c" />
      <stop offset="50%" stop-color="#141a2e" />
      <stop offset="100%" stop-color="#0a0d18" />
    </linearGradient>

    <!-- Card Glow / Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#48e5c2" />
      <stop offset="50%" stop-color="#d4af37" />
      <stop offset="100%" stop-color="#b97cf8" />
    </linearGradient>

    <!-- Avatar Gradient -->
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#48e5c2" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Stat Box Gradient -->
    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.07)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)" />
    </linearGradient>

    <!-- Star Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    .font-title { font-family: 'Segoe UI', Inter, Roboto, sans-serif; font-weight: 800; }
    .font-main { font-family: 'Segoe UI', Inter, Roboto, sans-serif; font-weight: 600; }
    .font-num { font-family: 'Segoe UI', Inter, Roboto, sans-serif; font-weight: 700; }
  </style>

  <!-- Background Base -->
  <rect x="0" y="0" width="850" height="490" rx="24" fill="url(#bgGrad)" />

  <!-- Outer Glow Border -->
  <rect x="3" y="3" width="844" height="484" rx="22" fill="none" stroke="url(#borderGrad)" stroke-width="2" stroke-opacity="0.8" />

  <!-- Inner Delicate Border -->
  <rect x="12" y="12" width="826" height="466" rx="16" fill="none" stroke="rgba(212, 175, 55, 0.25)" stroke-width="1" />

  <!-- Header Section -->
  <text x="40" y="46" fill="#d4af37" class="font-title" font-size="13" letter-spacing="3">✦ TEYVAT TRAVELER PASSPORT ✦</text>
  <text x="810" y="46" text-anchor="end" fill="#94a3b8" class="font-main" font-size="12" letter-spacing="1">GENSHIN FLOOD SYSTEM</text>
  <line x1="40" y1="58" x2="810" y2="58" stroke="rgba(212, 175, 55, 0.2)" stroke-width="1" />

  <!-- User Profile Section -->
  <!-- Avatar Circle -->
  <circle cx="95" cy="125" r="42" fill="url(#avatarGrad)" filter="url(#glow)" />
  <circle cx="95" cy="125" r="40" fill="url(#avatarGrad)" />
  <text x="95" y="137" text-anchor="middle" fill="#ffffff" class="font-title" font-size="34">${initial}</text>

  <!-- User Info -->
  <text x="160" y="112" fill="#ffffff" class="font-title" font-size="24">${safeName}</text>
  <text x="160" y="136" fill="#94a3b8" class="font-main" font-size="14">${safeUsername}</text>

  <!-- UID Pill -->
  <rect x="160" y="148" width="135" height="26" rx="6" fill="rgba(212, 175, 55, 0.15)" stroke="#d4af37" stroke-width="1" />
  <text x="227" y="165" text-anchor="middle" fill="#f59e0b" class="font-num" font-size="12">UID: ${safeUid}</text>

  <!-- Rank Badge -->
  <rect x="305" y="148" width="95" height="26" rx="6" fill="rgba(185, 124, 248, 0.15)" stroke="#b97cf8" stroke-width="1" />
  <text x="352" y="165" text-anchor="middle" fill="#b97cf8" class="font-num" font-size="12">РАНГ #${rank}</text>

  <!-- Status Pill (Top Right) -->
  <rect x="680" y="98" width="130" height="32" rx="8" fill="${statusBadgeBg}" stroke="${statusBadgeColor}" stroke-width="1" />
  <text x="745" y="119" text-anchor="middle" fill="${statusBadgeColor}" class="font-title" font-size="12">${statusBadgeText}</text>

  <!-- 4 Metrics Grid (Day / Week / Month / All-time) -->
  <!-- 1. Day (Today) -->
  <g transform="translate(40, 200)">
    <rect width="170" height="115" rx="14" fill="url(#boxGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
    <text x="20" y="32" fill="#e2e8f0" class="font-main" font-size="13">☀️ Сьогодні</text>
    <text x="20" y="74" fill="#ffffff" class="font-title" font-size="30">${Number(daily).toLocaleString()}</text>
    <text x="20" y="98" fill="#94a3b8" class="font-main" font-size="11">повідомлень</text>
  </g>

  <!-- 2. Week -->
  <g transform="translate(225, 200)">
    <rect width="180" height="115" rx="14" fill="url(#boxGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
    <text x="20" y="32" fill="#48e5c2" class="font-main" font-size="13">📅 Цей тиждень</text>
    <text x="20" y="74" fill="#48e5c2" class="font-title" font-size="30">${Number(weekly).toLocaleString()}</text>
    <text x="20" y="98" fill="#94a3b8" class="font-main" font-size="11">норма: ${quotaMin} пов.</text>
  </g>

  <!-- 3. Month -->
  <g transform="translate(420, 200)">
    <rect width="180" height="115" rx="14" fill="url(#boxGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
    <text x="20" y="32" fill="#e2e8f0" class="font-main" font-size="13">🌙 Цей місяць</text>
    <text x="20" y="74" fill="#ffffff" class="font-title" font-size="30">${Number(monthly).toLocaleString()}</text>
    <text x="20" y="98" fill="#94a3b8" class="font-main" font-size="11">повідомлень</text>
  </g>

  <!-- 4. All Time -->
  <g transform="translate(615, 200)">
    <rect width="195" height="115" rx="14" fill="url(#boxGrad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
    <text x="20" y="32" fill="#f59e0b" class="font-main" font-size="13">🏆 За весь час</text>
    <text x="20" y="74" fill="#f59e0b" class="font-title" font-size="30">${Number(total).toLocaleString()}</text>
    <text x="20" y="98" fill="#94a3b8" class="font-main" font-size="11">повідомлень</text>
  </g>

  <!-- Weekly Quota Progress Bar -->
  <g transform="translate(40, 340)">
    <rect width="770" height="70" rx="14" fill="rgba(11, 14, 23, 0.55)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
    
    <text x="20" y="28" fill="#cbd5e1" class="font-main" font-size="13">Прогрес щотижневої норми:</text>
    <text x="750" y="28" text-anchor="end" fill="${barColor}" class="font-title" font-size="14">${weekly} / ${quotaMin} (${quotaPercent}%)</text>

    <!-- Track -->
    <rect x="20" y="40" width="730" height="12" rx="6" fill="rgba(255, 255, 255, 0.1)" />
    <!-- Fill -->
    <rect x="20" y="40" width="${barWidth}" height="12" rx="6" fill="${barColor}" />
  </g>

  <!-- Bottom Footer Line -->
  <text x="40" y="450" fill="#64748b" class="font-main" font-size="11">✦ Статус імунітету: ${status === 'rest' ? 'Захищено рестом' : (weekly >= quotaMin ? 'Норму виконано (імунітет є)' : 'Потрібно добрати норму')}</text>
  <text x="810" y="450" text-anchor="end" fill="#64748b" class="font-main" font-size="11">Автоматичний аудит флуду</text>
</svg>
  `.trim();
}

/**
 * Render user card SVG to high-quality PNG Buffer
 * @param {Object} data - User stats and metadata
 * @returns {Buffer} PNG image buffer
 */
export async function renderCardPng(data) {
  const svg = generateCardSvg(data);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 850
    },
    font: {
      loadSystemFonts: true
    }
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
