#!/usr/bin/env bash
set -euo pipefail
BASE=${BASE:-http://localhost:8080}

# 1) Get PayPal client config
curl -s "$BASE/api/config/paypal" | jq .

# 2) Authenticate with Facebook (use a test short-lived token)
# TOKEN=...; curl -s -X POST "$BASE/api/auth/facebook" -H 'Content-Type: application/json' -d "{\"accessToken\":\"$TOKEN\"}" | jq .

# 3) Create a PayPal order (revive)
# USER_ID=...; curl -s -X POST "$BASE/api/payments/create" -H 'Content-Type: application/json' -d "{\"itemID\":\"revive\",\"userId\":\"$USER_ID\"}" | jq .

# 4) Capture order after approval
# ORDER_ID=...; curl -s -X POST "$BASE/api/payments/capture" -H 'Content-Type: application/json' -d "{\"orderID\":\"$ORDER_ID\",\"userId\":\"$USER_ID\"}" | jq .

# 5) Save state (JWT required)
# JWT=...; curl -s -X POST "$BASE/api/save" -H 'Authorization: Bearer '$JWT -H 'Content-Type: application/json' -d '{"level":11,"wave":2,"hp":80,"credits":10}' | jq .

# 6) Fetch save (JWT required)
# curl -s "$BASE/api/save/$USER_ID" -H 'Authorization: Bearer '$JWT | jq .