const express = require('express');
const { chromium } = require('playwright'); // теперь playwright!
const SEALS_RU = require('./seals_ru.json');

const app = express();
const port = process.env.PORT || 3000;

// === JD ===
function gregorianToJD(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
    + Math.floor(30.6001 * (month + 1))
    + day + B - 1524.5;
}

// === Local Kin ===
function calculateKin(year, month, day) {
  const jd = gregorianToJD(year, month, day);
  const jdEpoch = gregorianToJD(1987, 7, 26);
  const daysSinceEpoch = Math.floor(jd - jdEpoch);
  const kinNumber = ((daysSinceEpoch + 34 - 1) % 260) + 1;
  const tone = ((kinNumber - 1) % 13) + 1;
  const sealIndex = ((kinNumber - 1) % 20);
  return {
    kin: kinNumber,
    tone,
    seal: SEALS_RU[sealIndex],
  };
}

// === Playwright Parser ===
async function parseYamaya(year, month, day) {
  const url = `https://yamaya.ru/maya/choosedate/?action=setOwnDate&formday=${day}&formmonth=${month}&formyear=${year}`;
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

  // Используем brute-force через полный innerText
  const bodyText = await page.locator('body').innerText();

  await browser.close();

  const kinMatch = bodyText.match(/Кин:\s*(\d+)/);
  const toneMatch = bodyText.match(/Тон.*?:\s*([^\n]+)/);
  const sealMatch = bodyText.match(/Печать.*?:\s*([^\n]+)/);

  return {
    kin: kinMatch ? parseInt(kinMatch[1]) : null,
    tone: toneMatch ? toneMatch[1].trim() : null,
    seal: sealMatch ? sealMatch[1].trim() : null,
  };
}

// === API ===
app.get('/calculate-kin', async (req, res) => {
  const dateStr = req.query.date;
  if (!dateStr) return res.status(400).json({ error: "Укажи дату: ?date=YYYY-MM-DD" });

  const [year, month, day] = dateStr.split('-').map(Number);

  let fromParser = null;
  try {
    fromParser = await parseYamaya(year, month, day);
  } catch (e) {
    console.error("Parser error:", e);
  }

  const fromCalculation = calculateKin(year, month, day);

  res.json({
    input: dateStr,
    fromParser,
    fromCalculation,
  });
});

// === Root ===
app.get('/', (req, res) => {
  res.send('✨ Maya Kin API — /calculate-kin?date=YYYY-MM-DD');
});

// === Start ===
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
