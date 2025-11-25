const express = require('express');
const linkController = require('../controllers/linkController');

const router = express.Router();

router.get('/', (req, res) => {
  const frontendBaseUrl = req.app.locals.frontendBaseUrl;
  if (frontendBaseUrl) {
    res.redirect(302, frontendBaseUrl);
    return;
  }
  res.status(204).end();
});

router.get('/code/:code', (req, res) => {
  const frontendBaseUrl = req.app.locals.frontendBaseUrl;
  const code = req.params.code;
  if (frontendBaseUrl) {
    const target = `${frontendBaseUrl.replace(/\/$/, '')}/code/${encodeURIComponent(code)}`;
    res.redirect(302, target);
    return;
  }
  res.status(404).send('Not found');
});

router.get('/:code([A-Za-z0-9]{6,8})', linkController.redirectByCode);

module.exports = router;
