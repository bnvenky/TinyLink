const linkService = require('../services/linkService');

async function createLinkApi(req, res, next) {
  const url = req.body.url;
  const customCode = req.body.code || null;

  if (!url || !linkService.isValidUrl(url)) {
    res.status(400).json({ error: 'InvalidUrl', message: 'Please provide a valid http(s) URL.' });
    return;
  }

  try {
    const link = await linkService.createLink(url.trim(), customCode ? customCode.trim() : null);
    res.status(201).json({
      code: link.code,
      url: link.target_url,
      totalClicks: link.total_clicks,
      lastClickedAt: link.last_clicked_at
    });
  } catch (err) {
    if (err.status === 409) {
      res.status(409).json({ error: 'CodeExists', message: err.message });
      return;
    }
    if (err.status === 400) {
      res.status(400).json({ error: 'InvalidCode', message: err.message });
      return;
    }
    next(err);
  }
}

async function listLinksApi(req, res, next) {
  try {
    const links = await linkService.getAllLinks();
    const data = links.map(link => ({
      code: link.code,
      url: link.target_url,
      totalClicks: link.total_clicks,
      lastClickedAt: link.last_clicked_at
    }));
    res.json({ links: data });
  } catch (err) {
    next(err);
  }
}

async function getLinkStatsApi(req, res, next) {
  const code = req.params.code;
  try {
    const link = await linkService.getLinkByCode(code);
    if (!link) {
      res.status(404).json({ error: 'NotFound', message: 'Link not found' });
      return;
    }
    res.json({
      code: link.code,
      url: link.target_url,
      totalClicks: link.total_clicks,
      lastClickedAt: link.last_clicked_at
    });
  } catch (err) {
    next(err);
  }
}

async function deleteLinkApi(req, res, next) {
  const code = req.params.code;
  try {
    const deleted = await linkService.deleteLinkByCode(code);
    if (!deleted) {
      res.status(404).json({ error: 'NotFound', message: 'Link not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function redirectByCode(req, res, next) {
  const code = req.params.code;
  try {
    const click = await linkService.recordClick(code);
    if (!click) {
      res.status(404).send('Not found');
      return;
    }
    res.redirect(302, click.target_url);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLinkApi,
  listLinksApi,
  getLinkStatsApi,
  deleteLinkApi,
  redirectByCode
};
