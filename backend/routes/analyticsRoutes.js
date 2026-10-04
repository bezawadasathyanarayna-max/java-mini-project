const express = require('express');
const { getSummary, getCategoryBreakdown, getLocationBreakdown, getMonthlyReports } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/locations', getLocationBreakdown);
router.get('/monthly', getMonthlyReports);

module.exports = router;
