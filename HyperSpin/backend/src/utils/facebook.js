const axios = require('axios');

async function validateFacebookToken(accessToken) {
  const fields = 'id,name,email,picture.type(large)';
  const url = `https://graph.facebook.com/me?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`;
  const resp = await axios.get(url);
  return resp.data; // { id, name, email, picture }
}

async function fetchFriends(accessToken) {
  try {
    const url = `https://graph.facebook.com/me/friends?access_token=${encodeURIComponent(accessToken)}`;
    const resp = await axios.get(url);
    return resp.data.data || [];
  } catch (e) {
    return [];
  }
}

module.exports = { validateFacebookToken, fetchFriends };