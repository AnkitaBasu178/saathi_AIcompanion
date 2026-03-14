const IncidentReport = require('../models/IncidentReport');
const { validateIncidentReport } = require('../utils/validators');
const { encrypt, decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

async function createReport(req, res, next) {
    try {
        const sessionId = req.sessionId;
        const validation = validateIncidentReport(req.body);

        if (!validation.valid) {
            return res.status(400).json({ error: true, message: validation.error });
        }

        const data = validation.value;

        // Encrypt description before storing
        const encryptedDescription = encrypt(data.description);

        const report = await IncidentReport.create({
            sessionId,
            date: data.date,
            time: data.time,
            location: data.location,
            description: encryptedDescription,
            media_url: data.media_url,
        });

        res.json({
            success: true,
            reportId: report._id,
            message: 'Incident report saved securely. The description is encrypted for your safety.',
        });
    } catch (err) {
        next(err);
    }
}

async function getReports(req, res, next) {
    try {
        const sessionId = req.sessionId;
        const reports = await IncidentReport.find({ sessionId }).sort({ createdAt: -1 });

        // Decrypt descriptions before returning
        const decrypted = reports.map((report) => ({
            _id: report._id,
            date: report.date,
            time: report.time,
            location: report.location,
            description: decrypt(report.description),
            media_url: report.media_url,
            createdAt: report.createdAt,
        }));

        res.json({ reports: decrypted });
    } catch (err) {
        next(err);
    }
}

module.exports = { createReport, getReports };
