const express = require('express');
const router = express.Router();

router.get('/paypal', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID, env: process.env.PAYPAL_ENV || 'sandbox' });
});

router.get('/facebook', (req, res) => {
  res.json({ appId: process.env.FACEBOOK_APP_ID || '' });
});

router.get('/firebase', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  });
});

module.exports = router;