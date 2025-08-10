const express = require('express');
const { User, SaveState, Score } = require('../models');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Global leaderboard: by gameKey (default 'hyperspin').
router.get('/global', async (req, res) => {
  const gameKey = (req.query.game || 'hyperspin').toLowerCase();
  try {
    let rows;
    if (Score) {
      rows = await Score.findAll({
        where: { gameKey },
        order: [['score', 'DESC']],
        limit: 100,
        include: [{ model: User, as: 'user', attributes: ['id', 'displayName', 'profilePictureUrl'] }]
      });
      const leaderboard = rows.map((r) => ({
        userId: r.userId,
        displayName: r.user?.displayName || 'Player',
        profilePictureUrl: r.user?.profilePictureUrl || null,
        score: r.score,
      }));
      return res.json(leaderboard);
    }
    // Fallback: compute from SaveState level
    const users = await User.findAll({ include: [{ model: SaveState, as: 'saveState' }] });
    const lb = users.map((u) => ({ userId: u.id, displayName: u.displayName, score: u.saveState?.level || 1 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
    return res.json(lb);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// Logged-in user's rank and stats for a game
router.get('/me', authRequired, async (req, res) => {
  const userId = req.user.userId;
  const gameKey = (req.query.game || 'hyperspin').toLowerCase();
  let userScore = await Score.findOne({ where: { userId, gameKey } });
  if (!userScore) {
    const save = await SaveState.findOne({ where: { userId } });
    userScore = save ? { score: save.level } : { score: 0 };
  }
  // compute rank
  const top = await Score.findAll({ where: { gameKey }, order: [['score', 'DESC']], attributes: ['score'] });
  const scores = top.map((t) => t.score);
  const rank = scores.findIndex((s) => s <= (userScore.score || 0)) + 1 || scores.length + 1;
  res.json({ userId, gameKey, score: userScore.score || 0, rank, total: scores.length });
});

// Friends leaderboard (legacy, requires fb friends list)
router.get('/friends', authRequired, async (req, res) => {
  const userId = req.user.userId;
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