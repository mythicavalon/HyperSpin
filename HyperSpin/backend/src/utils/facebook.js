const axios = require('axios');
const crypto = require('crypto');

function hmacSHA256Hex(key, msg) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

async function verifyAccessToken(accessToken) {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) throw new Error('Missing Facebook app credentials');
  const appToken = `${appId}|${appSecret}`;
  const url = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appToken)}`;
  const resp = await axios.get(url);
  const data = resp.data?.data;
  if (!data?.is_valid) throw new Error('Facebook token invalid');
  if (data.app_id !== appId) throw new Error('Token not issued for this app');
  return data; // includes user_id, expires_at
}

async function validateFacebookToken(accessToken) {
  await verifyAccessToken(accessToken);
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const appsecret_proof = hmacSHA256Hex(appSecret, accessToken);
  const fields = 'id,name,email,picture.type(large)';
  const url = `https://graph.facebook.com/me?fields=${fields}&access_token=${encodeURIComponent(accessToken)}&appsecret_proof=${appsecret_proof}`;
  const resp = await axios.get(url);
  return resp.data; // { id, name, email, picture }
}

async function fetchFriends(accessToken) {
  try {
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const appsecret_proof = hmacSHA256Hex(appSecret, accessToken);
    const url = `https://graph.facebook.com/me/friends?access_token=${encodeURIComponent(accessToken)}&appsecret_proof=${appsecret_proof}`;
    const resp = await axios.get(url);
    return resp.data.data || [];
  } catch (e) {
    return [];
  }
}

module.exports = { validateFacebookToken, fetchFriends, verifyAccessToken };