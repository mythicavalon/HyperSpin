const express = require('express');
const { User, SaveState, Score } = require('../models');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [{ model: SaveState, as: 'saveState' }, { model: Score, as: 'scores' }] });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ id: user.id, displayName: user.displayName, level: user.saveState?.level || 1, lastActive: user.lastActive, scores: (user.scores || []).map(s => ({ gameKey: s.gameKey, score: s.score })) });
});

module.exports = router;