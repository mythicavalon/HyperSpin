const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPayPalClient } = require('../utils/paypal');
const { Purchase } = require('../models');
const { authRequired } = require('../middleware/auth');
const { grantItems } = require('../utils/purchases');

const router = express.Router();

function getItemPriceUSD(itemID, amountFromClient) {
  const revivePrice = parseFloat(process.env.REVIVE_PRICE_USD || '0.99');
  const priceMap = {
    revive: revivePrice,
    coins_small: 1.99,
    coins_medium: 4.99,
    coins_large: 9.99,
    skin_basic: 0.99,
  };
  if (itemID === 'donation') {
    const amt = Math.max(1.0, parseFloat(amountFromClient || '1'));
    return parseFloat(amt.toFixed(2));
  }
  return priceMap[itemID] || null;
}

router.post('/create', authRequired, async (req, res) => {
  try {
    const { itemID, amount } = req.body;
    const userId = req.user.userId;
    if (!itemID) return res.status(400).json({ error: 'Missing itemID' });

    const usdAmount = getItemPriceUSD(itemID, amount);
    if (!usdAmount) return res.status(400).json({ error: 'Unknown itemID' });

    const client = getPayPalClient();
    const request = new (require('@paypal/paypal-server-sdk').orders.OrdersCreateRequest)();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: uuidv4(),
          description: `HyperSpin ${itemID}`,
          amount: { currency_code: 'USD', value: usdAmount.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: 'HyperSpin',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    });

    const response = await client.execute(request);
    const orderId = response.result.id;

    await Purchase.create({ userId, itemID, amount: usdAmount, currency: 'USD', status: 'CREATED', paypalOrderId: orderId, raw: { createResponse: response.result } });

    res.json({ orderID: orderId });
  } catch (err) {
    console.error('Create order error', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/capture', authRequired, async (req, res) => {
  try {
    const { orderID } = req.body;
    const userId = req.user.userId;
    if (!orderID) return res.status(400).json({ error: 'Missing orderID' });

    const purchase = await Purchase.findOne({ where: { paypalOrderId: orderID, userId } });
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

    // Capture order server-side
    const client = getPayPalClient();
    const request = new (require('@paypal/paypal-server-sdk').orders.OrdersCaptureRequest)(orderID);
    request.requestBody({});
    const response = await client.execute(request);

    const captureStatus = response.result.status;

    // Basic validation: ensure captured amount equals expected
    try {
      const captured = response.result?.purchase_units?.[0]?.payments?.captures?.[0];
      const capturedAmount = parseFloat(captured?.amount?.value);
      const capturedCurrency = captured?.amount?.currency_code;
      if (capturedCurrency !== 'USD' || Number.isNaN(capturedAmount) || capturedAmount !== parseFloat(purchase.amount)) {
        console.warn('Capture amount/currency mismatch');
        return res.status(400).json({ error: 'Invalid capture amount' });
      }
    } catch (_) {
      // If structure not present, treat as failure
      return res.status(400).json({ error: 'Invalid capture response' });
    }

    // Update purchase status and raw
    purchase.raw = { ...purchase.raw, captureResponse: response.result };
    purchase.status = captureStatus;
    await purchase.save();

    if (captureStatus !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Grant items idempotently
    const { sequelize } = require('../models');
    await grantItems(sequelize, purchase);

    res.json({ ok: true });
  } catch (err) {
    console.error('Capture order error', err.message);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

module.exports = router;