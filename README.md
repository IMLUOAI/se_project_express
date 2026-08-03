# WTWR (What to Wear?) — Backend

Express + MongoDB API for the WTWR app: user auth (JWT), clothing items with likes, a Favorites collection (saved photo/video links), and an Album collection (uploaded photos/videos, stored in Cloudflare R2, plus saved links) per user.

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
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — Cloudflare R2 object storage, used for Album file uploads. See setup steps below.

### Setting up Cloudflare R2 (for Album uploads)

1. In the Cloudflare dashboard, go to **R2** and create a bucket (e.g. `wtwr-gallery`).
2. In the bucket's **Settings**, enable **Public access** (or connect a custom domain) and copy the public URL — that's `R2_PUBLIC_URL`.
3. Go to **R2 > Manage R2 API Tokens** and create a token with read/write access to the bucket. Copy the Access Key ID and Secret Access Key.
4. Your Account ID is shown in the Cloudflare dashboard sidebar (or in the R2 overview page).
5. Set all five as environment variables — locally in `.env`, and on Render under your service's **Environment** settings (never commit `.env`).

Since Render's free tier has an ephemeral disk, files are uploaded directly to R2 rather than saved to local disk — nothing here depends on the server's own filesystem persisting between deploys/restarts.

## API routes

- `POST /signup`, `POST /signin`
- `GET /items`, `POST /items`, `GET /items/:id`, `DELETE /items/:id`
- `PUT /items/:id/likes`, `DELETE /items/:id/likes`
- `GET /users/me`, `PATCH /users/me`
- `GET /favorites`, `POST /favorites`, `DELETE /favorites/:id`
- `GET /gallery` — list your Album items
- `POST /gallery/link` — save a link (body: `{ kind: "photo"|"video", url, title }`)
- `POST /gallery/upload` — upload a file (multipart/form-data, field name `file`, optional `title`), 25MB limit
- `DELETE /gallery/:id` — delete an Album item (also deletes the underlying file from R2 if it was an upload)

All routes except `/signup`, `/signin`, and `GET /items` require an `Authorization: Bearer <token>` header.

## Deployment

This app needs a persistent Node process and a MongoDB database — it cannot run on Cloudflare Pages/Workers as-is. Options that work well with a Cloudflare-fronted frontend:

- Host the API on Render, Railway, Fly.io, or a small VPS, with MongoDB Atlas (free tier) as the database.
- Point the frontend's `REACT_APP_API_URL` at the deployed API's HTTPS URL, and set `CLIENT_ORIGIN` here to the frontend's Cloudflare domain.

## Linting

```
npm run lint
```
