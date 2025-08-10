# HyperSpin Backend

Express + Sequelize (Postgres or sqlite) + PayPal + Facebook auth

## Setup

1. Copy `.env.example` to `.env` and fill values (use Sandbox for PayPal and Facebook test app):

```
cp .env.example .env
```

2. Install deps and run:

```
npm install
npm run dev
```

3. Default server: http://localhost:8080

The server serves the frontend statically from `../frontend` in development.

## Environment
- DATABASE_URL for Postgres; otherwise sqlite file used at `SQLITE_STORAGE`
- PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID
- PAYPAL_ENV=sandbox|live
- FACEBOOK_APP_ID / FACEBOOK_APP_SECRET
- JWT_SECRET
- CORS_ORIGINS: comma-separated list of allowed origins (e.g., `https://game.example.com,https://www.example.com`)
- REVIVE_PRICE_USD (optional, default 0.99)

## Endpoints
- GET `/api/config/paypal` returns `{ clientId, env }`
- GET `/api/config/facebook` returns `{ appId }`
- POST `/api/auth/facebook` { accessToken }
- GET `/api/user/:id`
- POST `/api/save` (JWT)
- GET `/api/save/:userId` (JWT)
- GET `/api/leaderboard/friends` (JWT)
- POST `/api/payments/create` (JWT) { itemID, amount? for donation }
- POST `/api/payments/capture` (JWT) { orderID }
- POST `/api/webhook/paypal` PayPal webhook with verification

## PayPal Webhook Setup
- Configure your webhook in the PayPal Developer Dashboard to point to `/api/webhook/paypal`
- Subscribe to `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.COMPLETED`
- Set `PAYPAL_WEBHOOK_ID` to the generated webhook id

## Facebook App Configuration
- Set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`
- Frontend fetches app id from `/api/config/facebook` and initializes FB SDK
- Backend verifies tokens via `debug_token` and uses `appsecret_proof` for Graph calls

## Security Notes
- No PayPal secrets in frontend
- All purchases verified server-side
- Payment routes require JWT; userId derived from token
- Currency and amount enforced server-side
- Idempotent item granting via centralized utility
- Rate limiting on auth and payment endpoints

## Testing
- Use PayPal Sandbox accounts and the curl examples in `../docs/curl-examples.sh`