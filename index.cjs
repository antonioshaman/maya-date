const express = require("express");
const axios = require("axios");
const SEALS_RU = require("./seals_ru.json");

const app = express();
const port = process.env.PORT || 3000;

// === JD и Dreamspell локальный ===
function gregorianToJD(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
         Math.floor(30.6001 * (month + 1)) +
         day + B - 1524.5;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function calculateKin(year, month, day) {
  const jd = gregorianToJD(year, month, day);
  const jdEpoch = gregorianToJD(1987, 7, 26);
  const daysSinceEpoch = Math.floor(jd - jdEpoch);

  const KIN_EPOCH = 34;
  const kinNumber = mod(daysSinceEpoch + KIN_EPOCH - 1, 260) + 1;
  const tone = mod(kinNumber - 1, 13) + 1;
  const sealIndex = mod(kinNumber - 1, 20);

  return {
    kin: kinNumber,
    tone,
    seal: SEALS_RU[sealIndex],
  };
}

// === API: /calculate-kin ===
app.get("/calculate-kin", async (req, res) => {
  const dateStr = req.query.date;

  if (!dateStr) {
    return res.status(200).send(`
      <h2>🌞 Maya Kin API</h2>
      <p>Укажи дату в формате <code>?date=YYYY-MM-DD</code>, например:</p>
      <pre><a href="/calculate-kin?date=1992-07-30">/calculate-kin?date=1992-07-30</a></pre>
      <p>Ответ будет содержать:</p>
      <ul>
        <li><b>input</b> — введённая дата</li>
        <li><b>fromCalculation</b> — локальный расчёт по Dreamspell</li>
        <li><b>fromParser</b> — данные с сайта yamaya.ru (если успешно)</li>
      </ul>
    `);
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const fromCalculation = calculateKin(year, month, day);

  let fromParser = null;
  try {
    const pyRes = await axios.get(
      `https://parse-yamaya-production.up.railway.app/parse-yamaya?date=${dateStr}`,
      { timeout: 20000 }
    );
    fromParser = pyRes.data;
  } catch (err) {
    console.error("❌ Ошибка Python:", err.message);
  }

  res.json({
    input: dateStr,
    fromParser,
    fromCalculation
  });
});

// === Корень /
app.get("/", (req, res) => {
  res.send(`
    <h1>✨ Maya Kin API</h1>
    <p>Введи дату, чтобы получить результат: <a href="/calculate-kin?date=1992-07-30">/calculate-kin?date=1992-07-30</a></p>
    <p><a href="/calculate-kin">Открыть документацию метода</a></p>
  `);
});

// === Старт
app.listen(port, () => {
  console.log(`✅ Node сервер запущен на порту ${port}`);
});
