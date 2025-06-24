const express = require("express");
const { spawn } = require("child_process");
const SEALS_RU = require("./seals_ru.json");

const app = express();
const port = process.env.PORT || 3000;

// === JD и Dreamspell локальный ===
function gregorianToJD(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
    + Math.floor(30.6001 * (month + 1))
    + day + B - 1524.5;
}

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

// === Express endpoint ===
app.get("/calculate-kin", async (req, res) => {
  const dateStr = req.query.date;
  if (!dateStr) return res.status(400).json({ error: "Укажи дату: ?date=YYYY-MM-DD" });
  const [year, month, day] = dateStr.split("-").map(Number);

  // Fallback local calculation
  const fromCalculation = calculateKin(year, month, day);

  // Call Python for parsing
  const py = spawn("python3", ["parse_yamaya.py", year, month, day]);
  let data = "";
  py.stdout.on("data", (chunk) => { data += chunk; });
  py.stderr.on("data", (err) => console.error(`PyErr: ${err}`));
  py.on("close", (code) => {
    let fromParser = null;
    try { fromParser = JSON.parse(data); } catch (e) { console.error(e); }
    res.json({ input: dateStr, fromParser, fromCalculation });
  });
});

// === Root ===
app.get("/", (req, res) => {
  res.send("✨ Maya Kin API — Node+Python version");
});

// === Start ===
app.listen(port, () => {
  console.log(`✅ Node server running on port ${port}`);
});
