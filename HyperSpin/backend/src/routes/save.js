const express = require('express');
const { authRequired } = require('../middleware/auth');
const { SaveState, Score } = require('../models');

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { userId } = req.user;
  const payload = req.body || {};
  const [save] = await SaveState.findOrCreate({ where: { userId }, defaults: { ...payload, userId } });
  if (!save.isNewRecord) {
    Object.assign(save, payload);
    save.lastSaveAt = new Date();
    await save.save();
  }
  // Update global score for hyperspin game using level
  try {
    const scoreValue = Number.isFinite(payload.level) ? payload.level : (save.level || 0);
    if (Score && Number.isFinite(scoreValue)) {
      const [score] = await Score.findOrCreate({ where: { userId, gameKey: 'hyperspin' }, defaults: { userId, gameKey: 'hyperspin', score: scoreValue } });
      if (!score.isNewRecord && score.score < scoreValue) {
        score.score = scoreValue;
        await score.save();
      }
    }
  } catch (_) {}
  res.json({ ok: true });
});

router.get('/:userId', authRequired, async (req, res) => {
  if (req.user.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
  const save = await SaveState.findOne({ where: { userId: req.params.userId } });
  res.json(save || {});
});

module.exports = router;