# WTWR (What to Wear?) — Backend

Express + MongoDB API for the WTWR app: user auth (JWT), clothing items with likes, and a Favorites collection (saved photo/video links) per user.

## Setup

```
npm install
cp .env.example .env   # fill in real values
npm run dev            # nodemon, auto-restarts on changes
# or
npm start
```

Requires a running MongoDB instance reachable at `MONGODB_URI`.

### Environment variables

See `.env.example`:

- `MONGODB_URI` — MongoDB connection string (use MongoDB Atlas for a hosted deployment).
- `JWT_SECRET` — long random string used to sign auth tokens.
- `PORT` — port the server listens on (default `3001`).
- `CLIENT_ORIGIN` — comma-separated list of allowed frontend origins for CORS in production (e.g. `https://wtwr.yourdomain.com`).

## API routes

- `POST /signup`, `POST /signin`
- `GET /items`, `POST /items`, `GET /items/:id`, `DELETE /items/:id`
- `PUT /items/:id/likes`, `DELETE /items/:id/likes`
- `GET /users/me`, `PATCH /users/me`
- `GET /favorites`, `POST /favorites`, `DELETE /favorites/:id`

All routes except `/signup`, `/signin`, and `GET /items` require an `Authorization: Bearer <token>` header.

## Deployment

This app needs a persistent Node process and a MongoDB database — it cannot run on Cloudflare Pages/Workers as-is. Options that work well with a Cloudflare-fronted frontend:

- Host the API on Render, Railway, Fly.io, or a small VPS, with MongoDB Atlas (free tier) as the database.
- Point the frontend's `REACT_APP_API_URL` at the deployed API's HTTPS URL, and set `CLIENT_ORIGIN` here to the frontend's Cloudflare domain.

## Linting

```
npm run lint
```
