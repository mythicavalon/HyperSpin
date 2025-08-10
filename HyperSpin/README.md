# HyperSpin

Production-ready browser game stack (Phaser + Node/Express + PayPal + Facebook Login)

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

## Environment Variables
See `backend/.env.example`.

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

## Deployment
- Frontend: host static `frontend` on Netlify/GitHub Pages
- Backend: Dockerfile provided; set environment variables and run

## Security Notes
- No PayPal secrets in frontend
- All purchases verified server-side
- Rate limiting on auth and payment endpoints
- CORS restricted to configured origins
- Idempotent item grants

## Testing
- Use PayPal Sandbox accounts and the curl examples in `docs/curl-examples.sh`