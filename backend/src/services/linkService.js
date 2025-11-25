const db = require('../db');

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function isValidCode(value) {
  return /^[A-Za-z0-9]{6,8}$/.test(value);
}

function generateCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * chars.length);
    result += chars[index];
  }
  return result;
}

async function generateUniqueCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = generateCode(6);
    const existing = await db.query('SELECT 1 FROM links WHERE code = $1', [code]);
    if (existing.rowCount === 0) {
      return code;
    }
  }
  throw new Error('Unable to generate unique code');
}

async function createLink(targetUrl, customCode) {
  let code = customCode;
  if (code) {
    if (!isValidCode(code)) {
      const error = new Error('Code must match [A-Za-z0-9]{6,8}');
      error.status = 400;
      throw error;
    }
    const existing = await db.query('SELECT 1 FROM links WHERE code = $1', [code]);
    if (existing.rowCount > 0) {
      const error = new Error('Code already exists');
      error.status = 409;
      throw error;
    }
  } else {
    code = await generateUniqueCode();
  }

  try {
    const result = await db.query(
      'INSERT INTO links (code, target_url) VALUES ($1, $2) RETURNING code, target_url, total_clicks, last_clicked_at, created_at',
      [code, targetUrl]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      const conflict = new Error('Code already exists');
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
}

async function getAllLinks() {
  const result = await db.query(
    'SELECT code, target_url, total_clicks, last_clicked_at, created_at FROM links ORDER BY created_at DESC'
  );
  return result.rows;
}

async function getLinkByCode(code) {
  const result = await db.query(
    'SELECT code, target_url, total_clicks, last_clicked_at, created_at FROM links WHERE code = $1',
    [code]
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
}

async function deleteLinkByCode(code) {
  const result = await db.query('DELETE FROM links WHERE code = $1', [code]);
  return result.rowCount > 0;
}

async function recordClick(code) {
  const result = await db.query(
    'UPDATE links SET total_clicks = total_clicks + 1, last_clicked_at = NOW() WHERE code = $1 RETURNING code, target_url',
    [code]
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
}

module.exports = {
  isValidUrl,
  isValidCode,
  createLink,
  getAllLinks,
  getLinkByCode,
  deleteLinkByCode,
  recordClick
};
