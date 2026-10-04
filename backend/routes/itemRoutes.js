const express = require('express');
const {
  createLostItem,
  createFoundItem,
  getLostItems,
  getFoundItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', authMiddleware, getMyItems);
router.get('/lost', getLostItems);
router.get('/found', getFoundItems);
router.post('/lost', authMiddleware, createLostItem);
router.post('/found', authMiddleware, createFoundItem);
router.get('/:id', getItemById);
router.put('/:id', authMiddleware, updateItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
