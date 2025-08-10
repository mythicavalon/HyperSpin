const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPayPalClient } = require('../utils/paypal');
const { Purchase, User } = require('../models');

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

router.post('/create', async (req, res) => {
  try {
    const { itemID, amount, userId, currency } = req.body;
    if (!itemID || !userId) return res.status(400).json({ error: 'Missing itemID or userId' });

    const usdAmount = getItemPriceUSD(itemID, amount);
    if (!usdAmount) return res.status(400).json({ error: 'Unknown itemID' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const client = getPayPalClient();
    const request = new (require('@paypal/paypal-server-sdk').orders.OrdersCreateRequest)();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: uuidv4(),
          description: `HyperSpin ${itemID}`,
          amount: { currency_code: (currency || 'USD'), value: usdAmount.toFixed(2) },
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

    await Purchase.create({ userId: user.id, itemID, amount: usdAmount, currency: (currency || 'USD'), status: 'CREATED', paypalOrderId: orderId, raw: { createResponse: response.result } });

    res.json({ orderID: orderId });
  } catch (err) {
    console.error('Create order error', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/capture', async (req, res) => {
  try {
    const { orderID, userId } = req.body;
    if (!orderID || !userId) return res.status(400).json({ error: 'Missing orderID or userId' });

    const purchase = await Purchase.findOne({ where: { paypalOrderId: orderID, userId } });
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

    // Capture order server-side
    const client = getPayPalClient();
    const request = new (require('@paypal/paypal-server-sdk').orders.OrdersCaptureRequest)(orderID);
    request.requestBody({});
    const response = await client.execute(request);

    const captureStatus = response.result.status;
    if (captureStatus !== 'COMPLETED') {
      purchase.status = captureStatus;
      purchase.raw = { ...purchase.raw, captureResponse: response.result };
      await purchase.save();
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Idempotency: if already granted, return success
    if (purchase.status === 'COMPLETED') {
      return res.json({ ok: true });
    }

    // Grant items in a transaction
    const { sequelize } = require('../models');
    await sequelize.transaction(async (t) => {
      purchase.status = 'COMPLETED';
      purchase.raw = { ...purchase.raw, captureResponse: response.result };
      await purchase.save({ transaction: t });

      const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
      if (purchase.itemID === 'revive') {
        user.credits += 0; // revive is consumed immediately by client postMessage flow
      } else if (purchase.itemID.startsWith('coins_')) {
        const packMap = { coins_small: 100, coins_medium: 300, coins_large: 800 };
        user.credits += packMap[purchase.itemID] || 0;
      } else if (purchase.itemID.startsWith('skin_')) {
        // Skins inventory could be tracked in a separate table; stub here
      }
      await user.save({ transaction: t });
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Capture order error', err.message);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

module.exports = router;