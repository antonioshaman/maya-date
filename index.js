const express = require('express');
const MayaDate = require('./MayaDate'); // ✅ теперь точно работает!

const app = express();
const port = process.env.PORT || 3000;

app.get('/calculate-kin', (req, res) => {
  const dateStr = req.query.date;
  if (!dateStr) {
    return res.status(400).json({ error: "Provide ?date=YYYY-MM-DD" });
  }

  const date = new Date(dateStr);
  if (isNaN(date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const maya = new MayaDate(date);

  res.json({
    input: dateStr,
    longCount: maya.LongCount(),
    trecena: maya.trecena,
    tzolkin: maya.tzolkinDays[maya.veintena],
    haabMonth: maya.haabMonths[maya.haabmonth],
    haabDay: maya.haabday,
    glord: maya.glord
  });
});

app.listen(port, () => {
  console.log(`MayaDate API running on port ${port}`);
});
