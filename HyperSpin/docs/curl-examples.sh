#!/usr/bin/env bash
set -euo pipefail
BASE=${BASE:-http://localhost:8080}

# 1) Get PayPal client config
curl -s "$BASE/api/config/paypal" | jq .
# 1b) Get Facebook app config
curl -s "$BASE/api/config/facebook" | jq .

# 2) Authenticate with Facebook (use a test short-lived token)
# TOKEN=...; curl -s -X POST "$BASE/api/auth/facebook" -H 'Content-Type: application/json' -d "{\"accessToken\":\"$TOKEN\"}" | jq .
# JWT=...

# 3) Create a PayPal order (revive) - JWT required
# USER_ID is derived from JWT on the server; not passed by client
# curl -s -X POST "$BASE/api/payments/create" -H 'Authorization: Bearer '$JWT -H 'Content-Type: application/json' -d '{"itemID":"revive"}' | jq .

# 4) Capture order after approval - JWT required
# ORDER_ID=...; curl -s -X POST "$BASE/api/payments/capture" -H 'Authorization: Bearer '$JWT -H 'Content-Type: application/json' -d "{\"orderID\":\"$ORDER_ID\"}" | jq .

# 5) Save state (JWT required)
# curl -s -X POST "$BASE/api/save" -H 'Authorization: Bearer '$JWT -H 'Content-Type: application/json' -d '{"level":11,"wave":2,"hp":80,"credits":10}' | jq .

# 6) Fetch save (JWT required)
# USER_ID is inside the JWT; server validates path id
# USER_ID=...; curl -s "$BASE/api/save/$USER_ID" -H 'Authorization: Bearer '$JWT | jq .

# 7) Leaderboard (JWT required)
# curl -s "$BASE/api/leaderboard/friends" -H 'Authorization: Bearer '$JWT | jq .

ID_TOKEN="REPLACE_WITH_FIREBASE_ID_TOKEN"
BASE="http://localhost:8080/api"

curl -s "$BASE/leaderboard/global?game=hyperspin" | jq .

curl -s -H "Authorization: Bearer $ID_TOKEN" "$BASE/leaderboard/me?game=hyperspin" | jq .

curl -s -X POST -H "Content-Type: application/json" -d '{"idToken":"'$ID_TOKEN'"}' "$BASE/auth/firebase" | jq .