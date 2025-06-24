const express = require('express');
const { chromium } = require('playwright');
const SEALS_RU = require('./seals_ru.json');

const app = express();
const port = process.env.PORT || 3000;

// === Gregorian to JD ===
function gregorianToJD(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
    + Math.floor(30.6001 * (month + 1))
    + day + B - 1524.5;
}

// === Local Dreamspell calculation ===
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

// === Playwright parser ===
async function parseYamaya(year, month, day) {
  const url = `https://yamaya.ru/maya/choosedate/?action=setOwnDate&formday=${day}&formmonth=${month}&formyear=${year}`;
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

  const kinText = await page.textContent('xpath=//b[contains(text(),"Кин:")]/following-sibling::text()[1]');
  const toneText = await page.textContent('xpath=//b[contains(text(),"Тон")]/following-sibling::text()[1]');
  const sealText = await page.textContent('xpath=//b[contains(text(),"Печать")]/following-sibling::text()[1]');

  await browser.close();

  return {
    kin: kinText ? parseInt(kinText.trim()) : null,
    tone: toneText ? toneText.trim() : null,
    seal: sealText ? sealText.trim() : null,
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
