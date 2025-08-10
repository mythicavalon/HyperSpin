/* Firebase Admin initialization */

const admin = require('firebase-admin');

let app;

function getFirebaseAdmin() {
  if (app) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  // Support base64-encoded private key and \n escaping
  if (privateKey.startsWith('-----BEGIN') === false) {
    try {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
    } catch (_) {}
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  });

  return admin;
}

async function verifyIdToken(idToken) {
  const adminSdk = getFirebaseAdmin();
  if (!adminSdk) throw new Error('Firebase Admin not configured');
  return adminSdk.auth().verifyIdToken(idToken);
}

module.exports = { getFirebaseAdmin, verifyIdToken };