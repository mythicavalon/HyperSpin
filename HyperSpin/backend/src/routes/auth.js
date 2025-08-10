const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validateFacebookToken, fetchFriends } = require('../utils/facebook');

const router = express.Router();

router.post('/facebook', async (req, res) => {
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