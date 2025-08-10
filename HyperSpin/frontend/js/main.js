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

async function initFacebook() {
  const res = await fetch(`${API_BASE}/config/facebook`);
  const { appId } = await res.json();
  window.fbAsyncInit = function () {
    // eslint-disable-next-line no-undef
    FB.init({
      appId: appId || undefined,
      cookie: true,
      xfbml: false,
      version: 'v19.0',
    });
  };
}

async function loginWithFacebook() {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
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
          try { mergeAndSyncSave(loadSave()); } catch (_) {}
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

function persistLocal(save) {
  localStorage.setItem('hs_save', JSON.stringify(save));
}

function mergeAndSyncSave(localSave) {
  if (!auth.jwt || !auth.user) return;
  fetch(`${API_BASE}/save/${auth.user.id}`, { headers: { Authorization: `Bearer ${auth.jwt}` } })
    .then((r) => r.json())
    .then((remote) => {
      const merged = { ...remote, ...localSave };
      persistLocal(merged);
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
  // eslint-disable-next-line no-undef
  const game = new Phaser.Game(config);
  game.registry.set('auth', auth);
  game.registry.set('payments', new PaymentsClient());
  return game;
}

initFacebook();
const localSave = loadSave();
createGame();

window.HyperSpin = { loginWithFacebook, Analytics, auth, mergeAndSyncSave, loadSave };

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'purchase_completed') {
    Analytics.purchaseCompleted(e.data.itemID);
  }
});

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    try { mergeAndSyncSave(loadSave()); } catch (_) {}
  }
});

window.addEventListener('beforeunload', () => {
  try { mergeAndSyncSave(loadSave()); } catch (_) {}
});