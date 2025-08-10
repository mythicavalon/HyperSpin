const express = require('express');
const axios = require('axios');
const { Purchase } = require('../models');
const { grantItems } = require('../utils/purchases');

const router = express.Router();

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const base = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase() === 'live' ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';
  const resp = await axios.post(`${base}/v1/oauth2/token`, 'grant_type=client_credentials', {
    auth: { username: clientId, password: clientSecret },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return { token: resp.data.access_token, base };
}

router.post('/paypal', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const transmissionId = req.header('paypal-transmission-id');
    const transmissionTime = req.header('paypal-transmission-time');
    const certUrl = req.header('paypal-cert-url');
    const authAlgo = req.header('paypal-auth-algo');
    const transmissionSig = req.header('paypal-transmission-sig');
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    const { token, base } = await getAccessToken();

    const verifyResp = await axios.post(
      `${base}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: req.body,
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    if (verifyResp.data.verification_status !== 'SUCCESS') {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = event.resource?.id || event.resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        const purchase = await Purchase.findOne({ where: { paypalOrderId: orderId } });
        if (purchase) {
          if (purchase.status !== 'COMPLETED') {
            purchase.status = 'COMPLETED';
            purchase.raw = { ...purchase.raw, webhookEvent: event };
            await purchase.save();
          }
          const { sequelize } = require('../models');
          await grantItems(sequelize, purchase);
        }
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error', err.message);
    res.status(500).send('Error');
  }
});

module.exports = router;