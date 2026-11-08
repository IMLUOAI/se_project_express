# FitCheck social v1 + album social — backend

Deploy this FIRST, before the app zip. The app degrades gracefully to
"coming soon" states on 404 until this is live on Render.

## What it adds

- **Comments** (`models/comment.js`, `controllers/comment.js`, `routes/comment.js`)
  - `GET /comments?targetType=fit|post|gallery&targetId=<id>` — oldest first, author populated.
  - `POST /comments` (auth) — `{ targetType, targetId, text }`, text max 500 chars.
  - `DELETE /comments/:id` (auth) — the comment's author, or the owner of the thing commented on.
  - Commenting bumps a denormalized `commentCount` on the target (guarded decrement, never below 0).
- **Shelf posts** (`models/post.js`, `controllers/post.js`, `routes/post.js`)
  - `GET /posts`, `POST /posts` (auth), `DELETE /posts/:id` (owner only, also removes its comments), `PUT/DELETE /posts/:id/likes`.
- **Fits** (`models/fit.js`) — gains `commentCount` (default 0).
- **Album social** (`models/galleryItem.js`, `controllers/galleryItem.js`, `routes/galleryItem.js`)
  - `GalleryItem` gains `isPublic` (default **false** — albums stay private unless shared), `likes`, `commentCount`.
  - `GET /gallery/public` (auth) — public album photos from OTHER users, newest first, owner populated. Own items are excluded; they live under `GET /gallery`.
  - `PATCH /gallery/:id/visibility` (auth, owner only) — `{ isPublic: true|false }`.
  - `PUT /gallery/:id/likes` / `DELETE /gallery/:id/likes` (auth) — mirror the fit/post like endpoints.
  - Deleting a gallery item now also removes its comments (mirrors post delete).
  - Comments extend to album photos: `targetType` accepts `"gallery"` in the Comment model, the comment controller, and validation.
- **Validation** (`middlewares/validation.js`) — `validateComment` / `validateCommentList` accept `fit | post | gallery`; new `validateGalleryVisibility`.
- **Routes** (`routes/index.js`) — mounts `/comments` and `/posts`. `/gallery` was already mounted (behind auth); no change needed for the album routes.

## Deploy

From the backend repo (`se_project_express`):

```bash
git add <the files above>
git commit -m "Social v1 + album social"
git push
```

Render redeploys automatically. Verify with:

```bash
curl https://se-project-express-5lx6.onrender.com/comments?targetType=fit&targetId=<any-valid-id>
curl https://se-project-express-5lx6.onrender.com/gallery/public -H "Authorization: Bearer <token>"
```

Both should answer (empty arrays are fine) instead of 404.

## Rules

- The feed is public to all signed-in users. No friends/follows in v1.
- Comment max 500 chars; post note max 280.
- Album photos are private until their owner taps "Make public".
- NOT built (v2): follows/friends, friends-only visibility, reporting/moderation beyond owner-delete, push notifications for comments.
