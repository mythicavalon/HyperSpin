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
- FACEBOOK_APP_ID / FACEBOOK_APP_SECRET (client uses JS SDK; backend validates user token)
- JWT_SECRET

## Endpoints
- POST `/api/auth/facebook` { accessToken }
- GET `/api/user/:id`
- POST `/api/save` (JWT)
- GET `/api/save/:userId` (JWT)
- GET `/api/leaderboard/friends?userId=...`
- POST `/api/payments/create` { itemID, amount?, userId }
- POST `/api/payments/capture` { orderID, userId }
- POST `/api/webhook/paypal` PayPal webhook with verification
- GET `/api/config/paypal` returns `{ clientId, env }`

## Curl examples
See `../docs/curl-examples.sh`.