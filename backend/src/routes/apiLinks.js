const express = require('express');
const linkController = require('../controllers/linkController');

const router = express.Router();

router.post('/links', linkController.createLinkApi);
router.get('/links', linkController.listLinksApi);
router.get('/links/:code', linkController.getLinkStatsApi);
router.delete('/links/:code', linkController.deleteLinkApi);

module.exports = router;
