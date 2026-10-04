const pool = require('../db');

async function getUsers(req, res) {
  try {
    const [rows] = await pool.execute('SELECT id, full_name, student_id, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    return res.status(200).json({ success: true, users: rows });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch users.' });
  }
}

async function getItems(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT i.*, u.full_name AS reporter_name
       FROM items i
       JOIN users u ON u.id = i.user_id
       ORDER BY i.created_at DESC`
    );
    return res.status(200).json({ success: true, items: rows });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch items.' });
  }
}

async function getClaims(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, i.item_name, i.category, i.location, u.full_name AS reporter_name
       FROM claims c
       JOIN items i ON i.id = c.item_id
       JOIN users u ON u.id = i.user_id
       ORDER BY c.created_at DESC`
    );

    return res.status(200).json({ success: true, claims: rows });
  } catch (error) {
    console.error('Get claims error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch claims.' });
  }
}

async function approveClaim(req, res) {
  try {
    const { id } = req.params;
    const [check] = await pool.execute('SELECT * FROM claims WHERE id = ?', [id]);

    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    await pool.execute('UPDATE claims SET status = ?, updated_at = NOW() WHERE id = ?', ['APPROVED', id]);
    await pool.execute('UPDATE items SET status = ?, updated_at = NOW() WHERE id = (SELECT item_id FROM claims WHERE id = ?)', ['CLAIMED', id]);

    return res.status(200).json({ success: true, message: 'Claim approved.' });
  } catch (error) {
    console.error('Approve claim error:', error);
    return res.status(500).json({ success: false, message: 'Could not approve claim.' });
  }
}

async function rejectClaim(req, res) {
  try {
    const { id } = req.params;
    const [check] = await pool.execute('SELECT * FROM claims WHERE id = ?', [id]);

    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    await pool.execute('UPDATE claims SET status = ?, updated_at = NOW() WHERE id = ?', ['REJECTED', id]);
    return res.status(200).json({ success: true, message: 'Claim rejected.' });
  } catch (error) {
    console.error('Reject claim error:', error);
    return res.status(500).json({ success: false, message: 'Could not reject claim.' });
  }
}

async function resolveItem(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await pool.execute('UPDATE items SET status = ?, updated_at = NOW() WHERE id = ?', ['RETURNED', id]);

    return res.status(200).json({ success: true, message: 'Item marked as returned/resolved.' });
  } catch (error) {
    console.error('Resolve item error:', error);
    return res.status(500).json({ success: false, message: 'Could not resolve item.' });
  }
}

async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await pool.execute('DELETE FROM claims WHERE item_id = ?', [id]);
    await pool.execute('DELETE FROM items WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Item deleted by admin.' });
  } catch (error) {
    console.error('Delete item by admin error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete item.' });
  }
}

module.exports = {
  getUsers,
  getItems,
  getClaims,
  approveClaim,
  rejectClaim,
  resolveItem,
  deleteItem,
};
