# HyperSpin Backend

- Express API secured by Firebase ID token verification
- Models: User, SaveState, Score
- Routes:
  - POST /api/auth/firebase { idToken }
  - GET /api/leaderboard/global?game=...
  - GET /api/leaderboard/me?game=...
  - POST /api/save (auth)
  - GET /api/save/:userId (auth)

Use `.env.example` as a reference.