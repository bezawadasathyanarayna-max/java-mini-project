const express = require('express');
const { getUsers, getItems, getClaims, approveClaim, rejectClaim, resolveItem, deleteItem } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', getUsers);
router.get('/items', getItems);
router.get('/claims', getClaims);
router.put('/claims/:id/approve', approveClaim);
router.put('/claims/:id/reject', rejectClaim);
router.put('/items/:id/resolve', resolveItem);
router.delete('/items/:id', deleteItem);

module.exports = router;
