# Family Tracking - Auth Starter (React Native + Node.js)

This is a minimal authentication scaffold for a family-tracking style app with two roles: `admin` and `user`.

- Backend: Node.js (Express), MongoDB (Mongoose), JWT auth
- Mobile: React Native (Expo), role-based navigation

## Backend Setup (TypeScript)

1. Go to `server/` and install dependencies:

```bash
cd server
npm install
```

2. Create `.env` (you can copy from below):

```
PORT=4000
JWT_SECRET=please_change_this_in_production
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin1234
```

3. Start the server:

```bash
npm run dev
```

- API base URL: `http://localhost:4000`
- Endpoints:
  - POST `/api/auth/register` ({ email, password, role? })
  - POST `/api/auth/login` ({ email, password })
  - GET `/api/me` (Bearer token)
  - GET `/api/admin/users` (admin only)

## Mobile Setup (Expo + TypeScript)

1. Go to `mobile/` and install dependencies:

```bash
cd mobile
npm install
```

2. Start the app:

```bash
npm run start
```

3. For real devices, set `EXPO_PUBLIC_API_URL` via `.env` in `mobile/` to your machine IP, e.g. `http://192.168.1.10:4000`.

Env examples:
- Server: create `server/.env` using `PORT`, `JWT_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `MONGODB_URI` (e.g. `mongodb://127.0.0.1:27017/family-tracking`).
- Mobile: create `mobile/.env` with `EXPO_PUBLIC_API_URL`.

## Notes

- A seed admin is created from `.env` on first run if missing.
- Tokens are stored using `expo-secure-store`.
- Navigation automatically switches between Admin and User home screens based on `user.role`.

## Next Steps

- Add real family tracking features (location, groups, invites)
- Add refresh tokens and password reset
- Add input validation and rate limiting
