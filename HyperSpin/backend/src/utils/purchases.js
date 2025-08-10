const { User } = require('../models');

async function grantItems(sequelize, purchase) {
  if (purchase.grantStatus === 'GRANTED' && purchase.grantedAt) {
    return false; // already granted
  }
  return await sequelize.transaction(async (t) => {
    const fresh = await purchase.reload({ transaction: t, lock: t.LOCK.UPDATE });
    if (fresh.grantStatus === 'GRANTED' && fresh.grantedAt) {
      return false;
    }

    const user = await User.findByPk(fresh.userId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!user) throw new Error('User not found for purchase');

    if (fresh.itemID === 'revive') {
      // No persistent credit; revive is applied client-side upon success
    } else if (fresh.itemID.startsWith('coins_')) {
      const packMap = { coins_small: 100, coins_medium: 300, coins_large: 800 };
      user.credits += packMap[fresh.itemID] || 0;
      await user.save({ transaction: t });
    } else if (fresh.itemID.startsWith('skin_')) {
      // TODO: implement inventory persistence later
    }

    fresh.grantStatus = 'GRANTED';
    fresh.grantedAt = new Date();
    await fresh.save({ transaction: t });
    return true;
  });
}

module.exports = { grantItems };