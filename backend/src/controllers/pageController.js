const linkService = require('../services/linkService');

async function renderDashboard(req, res, next) {
  try {
    const links = await linkService.getAllLinks();
    const baseUrl = req.app.locals.baseUrl;
    res.render('dashboard', {
      baseUrl,
      links,
      currentPath: '/'
    });
  } catch (err) {
    next(err);
  }
}

async function renderStats(req, res, next) {
  const code = req.params.code;
  try {
    const link = await linkService.getLinkByCode(code);
    const baseUrl = req.app.locals.baseUrl;
    if (!link) {
      res.status(404).render('stats', {
        baseUrl,
        link: null,
        code,
        currentPath: '/code'
      });
      return;
    }
    res.render('stats', {
      baseUrl,
      link,
      code,
      currentPath: '/code'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  renderDashboard,
  renderStats
};
