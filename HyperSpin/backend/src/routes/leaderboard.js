const express = require('express');
const { User, SaveState } = require('../models');

const router = express.Router();

router.get('/friends', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const me = await User.findByPk(userId);
  if (!me) return res.status(404).json({ error: 'Not found' });
  const friendsFbIds = Array.isArray(me.friends) ? me.friends : [];
  if (friendsFbIds.length === 0) return res.json([]);

  const friends = await User.findAll({ where: { fbId: friendsFbIds }, include: [{ model: SaveState, as: 'saveState' }] });
  const leaderboard = friends.map((u) => ({ id: u.id, displayName: u.displayName, level: u.saveState?.level || 1, lastActive: u.lastActive }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 50);
  res.json(leaderboard);
});

module.exports = router;