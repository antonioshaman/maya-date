const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// === 1) JD ===
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

// === 2) Dreamspell logic ===
function countSkippedDays(startYear, targetYear, month, day) {
  let leap = 0;
  let doot = 0;

  // Leap days: each 29 Feb after startYear up to targetYear
  for (let y = startYear + 1; y <= targetYear; y++) {
    if (isLeapYear(y)) {
      // if date is after 29 Feb in leap year, include this leap
      if (y < targetYear || (y === targetYear && (month > 2))) {
        leap++;
      }
    }
  }

  // Days Out Of Time: each 25 July from 1988 onwards
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

// === 3) Main route ===
app.get('/calculate-kin', (req, res) => {
  const dateStr = req.query.date;
  if (!dateStr) return res.status(400).json({ error: "Укажи дату: ?date=YYYY-MM-DD" });

  const [year, month, day] = dateStr.split('-').map(Number);

  const jd = gregorianToJD(year, month, day);
  const jdEpoch = gregorianToJD(1987, 7, 26); // Dreamspell zero point: 26.07.1987 = Kin 34

  const daysSinceEpoch = Math.floor(jd - jdEpoch);
  const skippedDays = countSkippedDays(1987, year, month, day);

  let kin = ((34 + daysSinceEpoch - skippedDays - 1) % 260) + 1;
  if (kin <= 0) kin += 260;

  const tone = ((kin - 1) % 13) + 1;
  const sealIndex = ((kin - 1) % 20);

  res.json({
    input: dateStr,
    jd,
    jdEpoch,
    daysSinceEpoch,
    skippedDays,
    kin,
    tone,
    seal: sealIndex + 1
  });
});

// === 4) Ping ===
app.get('/', (req, res) => {
  res.send('✨ Dreamspell Kin Calculator — используй ?date=YYYY-MM-DD');
});

app.listen(port, () => {
  console.log(`✅ Dreamspell Kin API on port ${port}`);
});
