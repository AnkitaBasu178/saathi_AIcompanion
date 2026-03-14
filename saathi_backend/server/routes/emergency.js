const router = require('express').Router();
const { triggerSOS, addContacts, getContacts } = require('../controllers/emergencyController');

router.post('/sos', triggerSOS);
router.post('/contacts', addContacts);
router.get('/contacts', getContacts);

module.exports = router;
