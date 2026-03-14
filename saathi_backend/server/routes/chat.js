const router = require('express').Router();
const { sendMessage, getHistory } = require('../controllers/chatController');
const abuseProtection = require('../middleware/abuseProtection');

router.post('/message', abuseProtection, sendMessage);
router.get('/history', getHistory);

module.exports = router;
