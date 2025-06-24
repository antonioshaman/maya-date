const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

/**
 * Локальный JD расчёт
 */
function gregorianToJD(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + B - 1524.5;
}

function countSkippedDays(startYear, targetYear, month, day) {
  let leap = 0;
  let doot = 0;

  for (let y = startYear + 1; y <= targetYear; y++) {
    if (isLeapYear(y)) {
      if (y < targetYear || (y === targetYear && month > 2)) {
        leap++;
      }
    }
  }

  for (let y = startYear + 1; y <= targetYear; y++) {
    if (y < targetYear || (y === targetYear && (month > 7 || (month === 7 && day > 25)))) {
      doot++;
    }
  }

  return leap + doot;
}

function isLeapYear(y) {
  return (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
}

/**
 * Локальный Dreamspell расчёт
 */
function calculateKin(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const jd = gregorianToJD(year, month, day);
  const jdEpoch = gregorianToJD(1987, 7, 26);
  const daysSinceEpoch = Math.floor(jd - jdEpoch);
  const skippedDays = countSkippedDays(1987, year, month, day);

  let kin = ((34 + daysSinceEpoch - skippedDays - 1) % 260) + 1;
  if (kin <= 0) kin += 260;

  const tone = ((kin - 1) % 13) + 1;
  const seal = ((kin - 1) % 20) + 1;

  return { kin, tone, seal, jd, jdEpoch, daysSinceEpoch, skippedDays };
}

/**
 * Парсер YAMAYA
 */
async function parseYamaya(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const url = `https://yamaya.ru/maya/choosedate/?action=setOwnDate&formday=${day}&formmonth=${month}&formyear=${year}`;
  console.log(`🌐 Парсер: ${url}`);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Node KinChecker)' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    let kin = '';
    let tone = '';
    let seal = '';
    let portal = '';
    let color = '';

    $('b').each((_, el) => {
      const text = $(el).text().trim();
      const next = $(el).next().text().trim();
      if (text.startsWith('Кин:')) kin = next || $(el).parent().text().replace('Кин:', '').trim();
      if (text.startsWith('Тон')) tone = text + ' ' + next;
      if (text.startsWith('Печать')) seal = text + ' ' + next;
      if (text.startsWith('Портал')) portal = next || $(el).parent().text().replace('Портал Галактической Активации:', '').trim();
      if (text.startsWith('Сила цвета')) color = next || $(el).parent().text().replace('Сила цвета:', '').trim();
    });

    // Если КИН пустой — значит парсер не нашёл
    if (!kin) return null;

    return { kin, tone, seal, portal, color };

  } catch (err) {
    console.error('❌ Парсер упал:', err.message);
    return null;
  }
}

/**
 * Основной эндпоинт
 */
app.get('/calculate-kin', async (req, res) => {
  const dateStr = req.query.date;
  if (!dateStr) return res.status(400).json({ error: "❌ Укажи ?date=YYYY-MM-DD" });

  const local = calculateKin(dateStr);
  const yamaya = await parseYamaya(dateStr);

  if (yamaya) {
    return res.json({
      input: dateStr,
      source: "YAMAYA",
      yamaya,
      fallback: local
    });
  } else {
    return res.json({
      input: dateStr,
      source: "LOCAL",
      local
    });
  }
});

/**
 * Ping
 */
app.get('/', (req, res) => {
  res.send('✨ Kin Calculator API with Yamaya check — используй /calculate-kin?date=YYYY-MM-DD');
});

/**
 * Run
 */
app.listen(port, () => {
  console.log(`✅ API запущен на http://localhost:${port}`);
});
