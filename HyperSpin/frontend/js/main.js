import { Analytics } from './analytics.js';
import { PaymentsClient } from './paymentsClient.js';
import BootScene from './game/BootScene.js';
import MainMenuScene from './game/MainMenuScene.js';
import GameScene from './game/GameScene.js';
import UIScene from './game/UIScene.js';
import PauseScene from './game/PauseScene.js';
import DeathScene from './game/DeathScene.js';
import UpgradesScene from './game/UpgradesScene.js';
import ShopScene from './game/ShopScene.js';
import LeaderboardScene from './game/LeaderboardScene.js';

const API_BASE = '/api';

let auth = { jwt: null, user: null };

function initFacebook() {
  window.fbAsyncInit = function () {
    FB.init({
      appId: 'YOUR_FB_APP_ID', // optional: can be overridden via data-attributes or env injection
      cookie: true,
      xfbml: false,
      version: 'v19.0',
    });
  };
}

async function loginWithFacebook() {
  return new Promise((resolve) => {
    FB.login(async (response) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        const res = await fetch(`${API_BASE}/auth/facebook`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken })
        });
        const data = await res.json();
        if (data.token) {
          auth.jwt = data.token;
          auth.user = data.user;
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    }, { scope: 'public_profile,email,user_friends' });
  });
}

function loadSave() {
  const local = JSON.parse(localStorage.getItem('hs_save') || '{}');
  return local;
}

function mergeAndSyncSave(localSave) {
  if (!auth.jwt || !auth.user) return;
  fetch(`${API_BASE}/save/${auth.user.id}`, { headers: { Authorization: `Bearer ${auth.jwt}` } })
    .then((r) => r.json())
    .then((remote) => {
      const merged = { ...remote, ...localSave };
      localStorage.setItem('hs_save', JSON.stringify(merged));
      return fetch(`${API_BASE}/save`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.jwt}` },
        body: JSON.stringify(merged),
      });
    })
    .catch(() => {});
}

function createGame() {
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#0b0f16',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, MainMenuScene, GameScene, UIScene, PauseScene, DeathScene, UpgradesScene, ShopScene, LeaderboardScene],
    input: { activePointers: 3 },
  };
  const game = new Phaser.Game(config);
  game.registry.set('auth', auth);
  game.registry.set('payments', new PaymentsClient());
  return game;
}

initFacebook();
const localSave = loadSave();
createGame();

window.HyperSpin = { loginWithFacebook, Analytics, auth };

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'purchase_completed') {
    // Optionally update credits or trigger revive
    Analytics.purchaseCompleted(e.data.itemID);
  }
});