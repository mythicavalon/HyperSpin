const express = require('express');
const router = express.Router();

router.get('/paypal', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID, env: process.env.PAYPAL_ENV || 'sandbox' });
});

router.get('/facebook', (req, res) => {
  res.json({ appId: process.env.FACEBOOK_APP_ID || '' });
});

module.exports = router;