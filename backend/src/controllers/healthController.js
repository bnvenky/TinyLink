const db = require('../db');

async function healthz(req, res) {
  let dbOk = true;
  try {
    await db.query('SELECT 1');
  } catch (e) {
    dbOk = false;
  }

  const startedAt = req.app.locals.startedAt;

  res.status(200).json({
    ok: true,
    version: '1.0',
    uptime: process.uptime(),
    startedAt,
    db: { ok: dbOk }
  });
}

module.exports = {
  healthz
};
