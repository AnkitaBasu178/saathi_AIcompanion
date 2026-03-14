const router = require('express').Router();
const { getNearby } = require('../controllers/supportController');

router.get('/nearby', getNearby);

module.exports = router;
