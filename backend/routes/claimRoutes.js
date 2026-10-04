const express = require('express');
const { createClaim, getMyClaims, getClaimById } = require('../controllers/claimController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', authMiddleware, getMyClaims);
router.post('/', authMiddleware, createClaim);
router.get('/:id', authMiddleware, getClaimById);

module.exports = router;
