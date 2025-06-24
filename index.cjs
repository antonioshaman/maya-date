const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 3000;

// === SEALS ===
const SEALS_RU = [
  { name: "Красный Дракон (Имиш)", short: "Красный Дракон" },
  { name: "Белый Ветер (Ик)", short: "Белый Ветер" },
  { name: "Синяя Ночь (Акбаль)", short: "Синяя Ночь" },
  { name: "Жёлтое Семя (Кан)", short: "Жёлтое Семя" },
  { name: "Красный Змей (Чик-Чан)", short: "Красный Змей" },
  { name: "Белый Соединитель Миров (Кими)", short: "Белый Соединитель Миров" },
  { name: "Синяя Рука (Маник)", short: "Синяя Рука" },
  { name: "Жёлтая Звезда (Ламат)", short: "Жёлтая Звезда" },
  { name: "Красная Луна (Мулук)", short: "Красная Луна" },
  { name: "Белая Собака (Ок)", short: "Белая Собака" },
  { name: "Синяя Обезьяна (Чуэн)", short: "Синяя Обезьяна" },
  { name: "Жёлтый Человек (Эб)", short: "Жёлтый Человек" },
  { name: "Красный Небесный Странник (Бэн)", short: "Красный Небесный Странник" },
  { name: "Белый Волшебник-Мудрец (Иш)", short: "Белый Волшебник-Мудрец" },
  { name: "Синий Орёл (Мэн)", short: "Синий Орёл" },
  { name: "Жёлтый Воин (Киб)", short: "Жёлтый Воин" },
  { name: "Красная Земля (Кабан)", short: "Красная Земля" },
  { name: "Белое Зеркало (Эцнаб)", short: "Белое Зеркало" },
  { name: "Синяя Буря (Кауак)", short: "Синяя Буря" },
  { name: "Жёлтое Солнце (Ахау)", short: "Жёлтое Солнце" }
];

// === JD ===
function gregorianToJD(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// === Puppeteer парсер ===
async function parseYamaya(date) {
  const [year, month, day] = date.split("-").map(Number);
  const url = `https://yamaya.ru/maya/choosedate/?action=setOwnDate&formday=${day}&formmonth=${month}&formyear=${year}`;
  let browser, page;
  try {
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const kin = await page.$eval(".result__kin .val", el => el.innerText.trim());
    return parseInt(kin) || null;
  } catch (e) {
    console.error("[Parser error]", e.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

// === API ===
app.get("/calculate-kin", async (req, res) => {
  const dateStr = req.query.date;
  if (!dateStr) return res.status(400).json({ error: "Укажи ?date=YYYY-MM-DD" });

  const parserKin = await parseYamaya(dateStr);

  const [year, month, day] = dateStr.split("-").map(Number);
  const jd = gregorianToJD(year, month, day);
  const jdEpoch = gregorianToJD(1987, 7, 26);
  const daysSinceEpoch = Math.floor(jd - jdEpoch);

  const kinRaw = (((34 + daysSinceEpoch - 1) % 260) + 260) % 260;
  const kin = kinRaw === 0 ? 260 : kinRaw;
  const tone = ((kin - 1) % 13) + 1;
  const seal = SEALS_RU[((kin - 1) % 20)] || {};

  res.json({
    input: dateStr,
    fromParser: parserKin,
    kin: parserKin || kin,
    tone: tone,
    seal: seal
  });
});

app.get("/", (req, res) => {
  res.send("✨ Maya Kin API. Используй: /calculate-kin?date=YYYY-MM-DD");
});

app.listen(port, () => {
  console.log(`✅ Maya Kin API запущен на ${port}`);
});
