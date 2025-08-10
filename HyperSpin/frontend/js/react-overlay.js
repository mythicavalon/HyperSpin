import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, getIdToken } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

const e = React.createElement;

function useFirebase() {
  const [state, setState] = React.useState({ app: null, auth: null, user: null, idToken: null, loading: true });

  React.useEffect(() => {
    let unsub = () => {};
    (async () => {
      const res = await fetch('/api/config/firebase');
      const config = await res.json();
      const app = initializeApp(config);
      const auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const idToken = await getIdToken(user, true);
          // Ensure backend user exists and get internal id
          try {
            const resp = await fetch('/api/auth/firebase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) });
            const data = await resp.json();
            const token = data.token || idToken;
            const simpleUser = { id: data.user?.id, displayName: data.user?.displayName || user.displayName };
            window.HyperSpin = window.HyperSpin || {};
            window.HyperSpin.auth = { jwt: token, user: simpleUser };
            try { window.HyperSpin.mergeAndSyncSave?.(window.HyperSpin.loadSave?.() || {}); } catch (_) {}
            setState({ app, auth, user: simpleUser, idToken: token, loading: false });
          } catch (e) {
            setState({ app, auth, user: null, idToken: null, loading: false });
          }
        } else {
          window.HyperSpin = window.HyperSpin || {};
          window.HyperSpin.auth = { jwt: null, user: null };
          setState({ app, auth, user: null, idToken: null, loading: false });
        }
      });
    })();
    return () => unsub();
  }, []);

  return state;
}

function AuthButtons() {
  const { auth, loading } = useFirebaseContext();
  const [busy, setBusy] = React.useState(false);

  const loginGoogle = async () => {
    setBusy(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } finally { setBusy(false); }
  };
  const loginFacebook = async () => {
    setBusy(true);
    try { await signInWithPopup(auth, new FacebookAuthProvider()); } finally { setBusy(false); }
  };
  const logout = async () => { setBusy(true); try { await signOut(auth); } finally { setBusy(false); } };

  const { user } = useFirebaseContext();
  if (loading) return null;
  return e('div', { className: 'auth-buttons' },
    user ? [
      e('span', { key: 'welcome', className: 'welcome' }, `Hi, ${user.displayName || 'Player'}`),
      e('button', { key: 'logout', onClick: logout, disabled: busy }, busy ? '...' : 'Logout')
    ] : [
      e('button', { key: 'g', onClick: loginGoogle, disabled: busy }, busy ? '...' : 'Login with Google'),
      e('button', { key: 'f', onClick: loginFacebook, disabled: busy }, busy ? '...' : 'Login with Facebook')
    ]
  );
}

function Leaderboard() {
  const { idToken } = useFirebaseContext();
  const [game, setGame] = React.useState('hyperspin');
  const [rows, setRows] = React.useState([]);
  const [me, setMe] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`/api/leaderboard/global?game=${encodeURIComponent(game)}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      if (idToken) {
        const meRes = await fetch(`/api/leaderboard/me?game=${encodeURIComponent(game)}`, { headers: { Authorization: `Bearer ${idToken}` } });
        if (meRes.ok) setMe(await meRes.json()); else setMe(null);
      } else setMe(null);
    })();
  }, [game, idToken]);

  return e('div', { className: 'leaderboard' }, [
    e('div', { key: 'filters', className: 'filters' }, [
      e('label', { key: 'label' }, 'Game: '),
      e('select', { key: 'sel', value: game, onChange: (e2) => setGame(e2.target.value) }, [
        e('option', { key: 'hs', value: 'hyperspin' }, 'HyperSpin')
      ])
    ]),
    e('ol', { key: 'list' }, rows.slice(0, 20).map((r, idx) => e('li', { key: r.userId || idx }, `${idx + 1}. ${r.displayName || 'Player'} - ${r.score}`))),
    me ? e('div', { key: 'me', className: 'me' }, `You: Rank #${me.rank} / ${me.total} - Score ${me.score}`) : null
  ]);
}

const FirebaseContext = React.createContext(null);
function useFirebaseContext() { return React.useContext(FirebaseContext); }

function App() {
  const fb = useFirebase();
  return e(FirebaseContext.Provider, { value: fb },
    e('div', { className: 'overlay-ui' }, [
      e('div', { key: 'topbar', className: 'topbar' }, e(AuthButtons)),
      e('div', { key: 'panel', className: 'panel' }, e(Leaderboard))
    ])
  );
}

function injectStyles() {
  const css = `
  .overlay-ui { position: fixed; top: 0; left: 0; right: 0; pointer-events: none; }
  .overlay-ui .topbar { display: flex; gap: 8px; padding: 8px; justify-content: flex-end; }
  .overlay-ui .topbar button, .overlay-ui .topbar span { pointer-events: auto; }
  .overlay-ui .panel { position: fixed; right: 12px; bottom: 12px; width: 280px; max-height: 60vh; overflow: auto; background: rgba(12,18,28,0.9); color: #eaf2ff; border: 1px solid #25324a; border-radius: 8px; padding: 8px; pointer-events: auto; }
  .overlay-ui .panel .filters { margin-bottom: 6px; }
  .auth-buttons { display: flex; gap: 8px; align-items: center; }
  `;
  const style = document.createElement('style');
  style.innerText = css;
  document.head.appendChild(style);
}

function mount() {
  injectStyles();
  const root = document.getElementById('react-root');
  if (!root) return;
  ReactDOM.createRoot(root).render(e(App));
}

mount();