const router = require('express').Router();
const { getInfo, searchHealth } = require('../controllers/healthController');

router.get('/info', getInfo);
router.get('/search', searchHealth);

module.exports = router;
