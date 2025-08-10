# HyperSpin

Upgrades included:
- Firebase Auth (Google, Facebook) with session persistence
- Secure backend using Firebase ID token verification
- User profiles and multi-game leaderboard
- React overlay for login/logout and leaderboard without breaking gameplay
- Deployment configs for Firebase Hosting (frontend) and Heroku (backend)

## Environment Variables
Create `.env` in `backend` with:
```
PORT=8080
DATABASE_URL= # optional for Postgres, otherwise sqlite is used
JWT_SECRET=legacy-compat
CORS_ORIGINS=
PAYPAL_CLIENT_ID=
PAYPAL_ENV=sandbox
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=
FIREBASE_MESSAGING_SENDER_ID=
# Admin credentials
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY= # base64-encoded or with \n escaped
```

## Running locally
- Backend: `cd backend && npm install && npm run dev`
- Open http://localhost:8080 to play. React overlay shows auth and leaderboard.

## Deployment
- Frontend: Firebase Hosting. `firebase.json` provided to host `HyperSpin/frontend`
- Backend: Heroku. `Procfile` provided. Set env vars accordingly.

## Features
- Mobile-first hyper-casual spinner/tapper gameplay (Phaser 3)
- Facebook Login -> backend issues JWT
- Local + cloud save (JWT-protected)
- Friends leaderboard via Facebook friend ids
- Payments via PayPal Smart Buttons with server-side verification
- Purchases: donations, revive, skins, coin packs
- Secure webhook for reconciliation

## Quickstart (local)

1) Backend
```
cd backend
cp .env.example .env
# Fill PAYPAL sandbox and FACEBOOK app values, set JWT_SECRET
npm install
npm run dev
```
Backend runs at http://localhost:8080 and serves frontend statically.

2) Frontend
Open http://localhost:8080 in your browser.

Payments page is at `/payments?item=revive&user=USER_ID`.

## Data Models
- `User`: id, fbId, displayName, credits, friends
- `SaveState`: userId, level, wave, hp, credits, upgrades, blades
- `Purchase`: id, userId, itemID, amount, currency, status, paypalOrderId, raw, grantStatus, grantedAt

## API
- GET `/api/config/paypal` -> `{ clientId, env }`
- GET `/api/config/facebook` -> `{ appId }`
- POST `/api/auth/facebook` -> JWT
- GET `/api/user/:id`
- POST `/api/save` (JWT)
- GET `/api/save/:userId` (JWT)
- GET `/api/leaderboard/friends` (JWT)
- POST `/api/payments/create` (JWT)
- POST `/api/payments/capture` (JWT)
- POST `/api/webhook/paypal`

## Security Notes
- No PayPal secrets in frontend
- All purchases verified server-side
- Rate limiting on auth and payment endpoints
- CORS restricted to configured origins
- Idempotent item grants

## Testing
- Use PayPal Sandbox accounts and the curl examples in `docs/curl-examples.sh`