const pool = require('../db');

async function getSummary(req, res) {
  try {
    const [users] = await pool.execute('SELECT COUNT(*) AS total FROM users');
    const [lostItems] = await pool.execute("SELECT COUNT(*) AS total FROM items WHERE item_type = 'LOST'");
    const [foundItems] = await pool.execute("SELECT COUNT(*) AS total FROM items WHERE item_type = 'FOUND'");
    const [returnedItems] = await pool.execute("SELECT COUNT(*) AS total FROM items WHERE status IN ('RETURNED', 'RESOLVED')");
    const [pendingClaims] = await pool.execute("SELECT COUNT(*) AS total FROM claims WHERE status = 'PENDING'");

    return res.status(200).json({
      success: true,
      summary: {
        totalUsers: users[0].total,
        totalLostItems: lostItems[0].total,
        totalFoundItems: foundItems[0].total,
        itemsReturned: returnedItems[0].total,
        activeClaims: pendingClaims[0].total,
      },
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    return res.status(500).json({ success: false, message: 'Could not load analytics summary.' });
  }
}

async function getCategoryBreakdown(req, res) {
  try {
    const [lost] = await pool.execute(
      "SELECT category, COUNT(*) AS total FROM items WHERE item_type = 'LOST' GROUP BY category ORDER BY total DESC"
    );
    const [found] = await pool.execute(
      "SELECT category, COUNT(*) AS total FROM items WHERE item_type = 'FOUND' GROUP BY category ORDER BY total DESC"
    );

    return res.status(200).json({
      success: true,
      lost: lost,
      found: found,
    });
  } catch (error) {
    console.error('Category analytics error:', error);
    return res.status(500).json({ success: false, message: 'Could not load category analytics.' });
  }
}

async function getLocationBreakdown(req, res) {
  try {
    const [lost] = await pool.execute(
      "SELECT location, COUNT(*) AS total FROM items WHERE item_type = 'LOST' GROUP BY location ORDER BY total DESC"
    );
    const [found] = await pool.execute(
      "SELECT location, COUNT(*) AS total FROM items WHERE item_type = 'FOUND' GROUP BY location ORDER BY total DESC"
    );

    return res.status(200).json({
      success: true,
      lost: lost,
      found: found,
    });
  } catch (error) {
    console.error('Location analytics error:', error);
    return res.status(500).json({ success: false, message: 'Could not load location analytics.' });
  }
}

async function getMonthlyReports(req, res) {
  try {
    const [lost] = await pool.execute(
      "SELECT DATE_FORMAT(date, '%Y-%m') AS month, COUNT(*) AS total FROM items WHERE item_type = 'LOST' GROUP BY month ORDER BY month ASC"
    );
    const [found] = await pool.execute(
      "SELECT DATE_FORMAT(date, '%Y-%m') AS month, COUNT(*) AS total FROM items WHERE item_type = 'FOUND' GROUP BY month ORDER BY month ASC"
    );

    return res.status(200).json({
      success: true,
      lost: lost,
      found: found,
    });
  } catch (error) {
    console.error('Monthly analytics error:', error);
    return res.status(500).json({ success: false, message: 'Could not load monthly analytics.' });
  }
}

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getLocationBreakdown,
  getMonthlyReports,
};
