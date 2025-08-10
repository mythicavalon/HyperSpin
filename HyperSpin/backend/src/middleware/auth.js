/* Authentication middleware: Firebase ID tokens preferred, legacy JWT fallback */

const jwt = require('jsonwebtoken');
const { verifyIdToken } = require('../utils/firebaseAdmin');
const { User } = require('../models');

async function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  // Try Firebase first
  try {
    const decoded = await verifyIdToken(token);
    const firebaseUid = decoded.uid;
    // Upsert local user minimally to ensure we have an internal ID
    let user = await User.findOne({ where: { firebaseUid } });
    if (!user) {
      user = await User.create({
        firebaseUid,
        displayName: decoded.name || null,
        email: decoded.email || null,
        profilePictureUrl: decoded.picture || null,
        provider: (decoded.firebase && decoded.firebase.sign_in_provider) || null,
      });
    }
    req.user = {
      userId: user.id,
      firebaseUid,
      email: user.email || decoded.email || null,
      name: user.displayName || decoded.name || null,
    };
    return next();
  } catch (e) {
    // continue to legacy JWT
  }

  // Legacy JWT for backwards compatibility
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authRequired };