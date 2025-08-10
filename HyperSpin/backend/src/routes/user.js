const express = require('express');
const { User, SaveState } = require('../models');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [{ model: SaveState, as: 'saveState' }] });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, displayName: user.displayName, level: user.saveState?.level || 1, lastActive: user.lastActive });
});

module.exports = router;