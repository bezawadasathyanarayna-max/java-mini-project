const pool = require('../db');
const { isRequired, isValidEmail, isValidPhone } = require('../utils/validation');

async function createClaim(req, res) {
  try {
    const { item_id, claimant_name, student_id, email, phone, proof_details, message } = req.body;

    if (!isRequired(item_id) || !isRequired(claimant_name) || !isRequired(student_id) || !isRequired(email) || !isRequired(phone) || !isRequired(proof_details)) {
      return res.status(400).json({ success: false, message: 'Please fill in all required claim fields.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    const [itemRows] = await pool.execute('SELECT * FROM items WHERE id = ?', [item_id]);

    if (itemRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const item = itemRows[0];

    if (item.item_type !== 'FOUND') {
      return res.status(400).json({ success: false, message: 'Claims can only be submitted for found items.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO claims (
        item_id,
        claimant_id,
        claimant_name,
        student_id,
        email,
        phone,
        proof_details,
        message,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
      [
        item_id,
        req.user.id,
        claimant_name.trim(),
        student_id.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        proof_details.trim(),
        message ? message.trim() : null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully.',
      claimId: result.insertId,
    });
  } catch (error) {
    console.error('Create claim error:', error);
    return res.status(500).json({ success: false, message: 'Could not submit claim.' });
  }
}

async function getMyClaims(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, i.item_name, i.category, i.location, i.date
       FROM claims c
       JOIN items i ON i.id = c.item_id
       WHERE c.claimant_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, claims: rows });
  } catch (error) {
    console.error('Get my claims error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch your claims.' });
  }
}

async function getClaimById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT c.*, i.item_name, i.category, i.location
       FROM claims c
       JOIN items i ON i.id = c.item_id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    const claim = rows[0];

    if (req.user.role !== 'admin' && claim.claimant_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You cannot view this claim.' });
    }

    return res.status(200).json({ success: true, claim });
  } catch (error) {
    console.error('Get claim by id error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch claim.' });
  }
}

module.exports = {
  createClaim,
  getMyClaims,
  getClaimById,
};
