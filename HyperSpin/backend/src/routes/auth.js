const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { User } = require('../models');
const { validateFacebookToken, fetchFriends } = require('../utils/facebook');
const { verifyIdToken } = require('../utils/firebaseAdmin');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.post('/firebase', authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    const decoded = await verifyIdToken(idToken);
    const firebaseUid = decoded.uid;

    const defaults = {
      firebaseUid,
      displayName: decoded.name || null,
      email: decoded.email || null,
      profilePictureUrl: decoded.picture || null,
      provider: (decoded.firebase && decoded.firebase.sign_in_provider) || null,
      lastActive: new Date(),
    };

    const [user] = await User.findOrCreate({ where: { firebaseUid }, defaults });
    if (!user.isNewRecord) {
      user.displayName = defaults.displayName || user.displayName;
      user.email = defaults.email || user.email;
      user.profilePictureUrl = defaults.profilePictureUrl || user.profilePictureUrl;
      user.provider = defaults.provider || user.provider;
      user.lastActive = new Date();
      await user.save();
    }

    // Return the Firebase idToken directly for frontend to use as bearer
    return res.json({ token: idToken, user: { id: user.id, displayName: user.displayName, email: user.email } });
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

router.post('/facebook', authLimiter, async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

    const fbProfile = await validateFacebookToken(accessToken);
    const friends = await fetchFriends(accessToken);
    const friendIds = friends.map((f) => f.id);

    const [user] = await User.findOrCreate({
      where: { fbId: fbProfile.id },
      defaults: {
        displayName: fbProfile.name,
        email: fbProfile.email || null,
        profilePictureUrl: fbProfile.picture?.data?.url || null,
        friends: friendIds,
      },
    });

    // Update minimal fields & friends on login
    user.displayName = fbProfile.name || user.displayName;
    user.profilePictureUrl = fbProfile.picture?.data?.url || user.profilePictureUrl;
    user.friends = friendIds;
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign({ userId: user.id, fbId: user.fbId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, displayName: user.displayName, fbId: user.fbId, credits: user.credits } });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(401).json({ error: 'Facebook token invalid' });
  }
});

module.exports = router;