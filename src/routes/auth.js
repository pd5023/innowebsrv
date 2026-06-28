const express = require('express');
const router = express.Router();
const { handleLogin } = require('../handlers/auth');

// Replicates: GET /includes/innophone/verification.php?z=login&q=getcred|user|pass
router.get('/', async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([{ error: 'missing' }]);

    const parts = q.split('|');
    const cmd = parts[0];

    if (cmd === 'getcred') {
      const username = parts[1]?.trim();
      const password = parts[2]?.trim();
      const result = await handleLogin(username, password);
      return res.json(result);
    }

    res.json([{ error: 'unknown_cmd' }]);
  } catch (err) {
    console.error(err);
    res.status(500).json([{ error: err.message }]);
  }
});

module.exports = router;
