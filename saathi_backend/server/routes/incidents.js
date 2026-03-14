const router = require('express').Router();
const { createReport, getReports } = require('../controllers/incidentController');

router.post('/report', createReport);
router.get('/reports', getReports);

module.exports = router;
