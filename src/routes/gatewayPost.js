const express = require('express');
const router = express.Router();
const { submitSr } = require('../handlers/sr');

// Replicates: POST /includes/dyncont/gatewayPost1SR.php
// Body is a JSON string: "type|host =|*|= payload"
router.post('/', async (req, res) => {
  try {
    let raw = req.body;
    if (typeof raw === 'string') {
      // Strip surrounding quotes if present
      raw = raw.replace(/^"|"$/g, '');
    }

    // Split on =|*|= separator to get type|host and payload
    const parts = raw.split(' =|*|= ');
    const meta    = parts[0] ?? '';
    const payload = parts[1] ?? raw;
    const type    = meta.split('|')[0];

    let result;
    if (type === 'sr') {
      result = await submitSr(payload);
    } else {
      result = [{ error: `unknown post type: ${type}` }];
    }

    res.json(result);
  } catch (err) {
    console.error('POST error:', err.message);
    res.status(500).json([{ error: err.message }]);
  }
});

module.exports = router;
