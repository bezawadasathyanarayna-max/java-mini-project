const pool = require('../db');
const { isRequired, isValidPhone } = require('../utils/validation');

function formatItemRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    item_type: row.item_type,
    item_name: row.item_name,
    category: row.category,
    description: row.description,
    date: row.date,
    time: row.time,
    location: row.location,
    color: row.color,
    brand: row.brand,
    unique_details: row.unique_details,
    image_url: row.image_url,
    contact_info: row.contact_info,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reporter_name: row.reporter_name,
    reporter_student_id: row.reporter_student_id,
    reporter_email: row.reporter_email,
    reporter_phone: row.reporter_phone,
  };
}

function validateItemPayload(payload) {
  const requiredFields = ['item_name', 'category', 'description', 'date', 'location'];

  for (const field of requiredFields) {
    if (!isRequired(payload[field])) {
      return `${field.replace('_', ' ')} is required.`;
    }
  }

  if (payload.contact_info && !isValidPhone(payload.contact_info)) {
    return 'Please provide a valid contact phone number.';
  }

  return null;
}

async function getItemsByType(req, res, itemType) {
  try {
    const { search = '', category = '', location = '', date = '', status = '' } = req.query;

    let sql = `
      SELECT i.*, u.full_name AS reporter_name, u.student_id AS reporter_student_id, u.email AS reporter_email, u.phone AS reporter_phone
      FROM items i
      JOIN users u ON u.id = i.user_id
      WHERE i.item_type = ?
    `;

    const values = [itemType];

    if (search) {
      sql += ' AND (i.item_name LIKE ? OR i.description LIKE ? OR i.location LIKE ?)';
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += ' AND i.category = ?';
      values.push(category);
    }

    if (location) {
      sql += ' AND i.location LIKE ?';
      values.push(`%${location}%`);
    }

    if (date) {
      sql += ' AND i.date = ?';
      values.push(date);
    }

    if (status) {
      sql += ' AND i.status = ?';
      values.push(status);
    }

    sql += ' ORDER BY i.created_at DESC';

    const [rows] = await pool.execute(sql, values);
    return res.status(200).json({
      success: true,
      items: rows.map(formatItemRow),
    });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch items.' });
  }
}

async function createItem(req, res, itemType) {
  try {
    const itemData = req.body;
    const validationError = validateItemPayload(itemData);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const [result] = await pool.execute(
      `INSERT INTO items (
        user_id,
        item_type,
        item_name,
        category,
        description,
        date,
        time,
        location,
        color,
        brand,
        unique_details,
        image_url,
        contact_info,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
      [
        req.user.id,
        itemType,
        itemData.item_name.trim(),
        itemData.category,
        itemData.description.trim(),
        itemData.date,
        itemData.time || null,
        itemData.location.trim(),
        itemData.color || null,
        itemData.brand || null,
        itemData.unique_details || null,
        itemData.image_url || null,
        itemData.contact_info || null,
      ]
    );

    const [newItem] = await pool.execute(
      `SELECT i.*, u.full_name AS reporter_name, u.student_id AS reporter_student_id
       FROM items i
       JOIN users u ON u.id = i.user_id
       WHERE i.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: `${itemType === 'LOST' ? 'Lost item' : 'Found item'} reported successfully.`,
      item: formatItemRow(newItem[0]),
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({ success: false, message: 'Could not save the item.' });
  }
}

async function getLostItems(req, res) {
  return getItemsByType(req, res, 'LOST');
}

async function getFoundItems(req, res) {
  return getItemsByType(req, res, 'FOUND');
}

async function getMyItems(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT i.*, u.full_name AS reporter_name, u.student_id AS reporter_student_id
       FROM items i
       JOIN users u ON u.id = i.user_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      items: rows.map(formatItemRow),
    });
  } catch (error) {
    console.error('Get my items error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch your reports.' });
  }
}

async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT i.*, u.full_name AS reporter_name, u.student_id AS reporter_student_id, u.email AS reporter_email, u.phone AS reporter_phone
       FROM items i
       JOIN users u ON u.id = i.user_id
       WHERE i.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    return res.status(200).json({
      success: true,
      item: formatItemRow(rows[0]),
    });
  } catch (error) {
    console.error('Get item by id error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch item details.' });
  }
}

async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const item = rows[0];

    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not allowed to edit this item.' });
    }

    const body = req.body;
    const updateFields = [];
    const values = [];

    const allowedFields = ['item_name', 'category', 'description', 'date', 'time', 'location', 'color', 'brand', 'unique_details', 'image_url', 'status'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    updateFields.push('updated_at = NOW()');
    values.push(id);

    await pool.execute(`UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`, values);

    return res.status(200).json({ success: true, message: 'Item updated successfully.' });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({ success: false, message: 'Could not update item.' });
  }
}

async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const item = rows[0];

    if (item.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not allowed to delete this item.' });
    }

    await pool.execute('DELETE FROM claims WHERE item_id = ?', [id]);
    await pool.execute('DELETE FROM items WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete item.' });
  }
}

module.exports = {
  createLostItem: (req, res) => createItem(req, res, 'LOST'),
  createFoundItem: (req, res) => createItem(req, res, 'FOUND'),
  getLostItems,
  getFoundItems,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
};
