const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'ai模块待开发' });
});

module.exports = router;
