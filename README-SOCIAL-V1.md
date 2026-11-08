# FitCheck Social v1 — backend patch

## What it adds
- **Comments** on fits and shelf posts: `Comment` model + `GET /comments`,
  `POST /comments`, `DELETE /comments/:id`. Comment counts are kept on the
  fit/post (`commentCount`). Anyone signed in can comment; the comment's
  author — or the owner of the fit/post — can delete it.
- **Shelf posts**: `Post` model + `GET /posts`, `POST /posts`,
  `DELETE /posts/:id`, `PUT/DELETE /posts/:id/likes`. A post is a snapshot
  of a book / song / other from the user's shelf.
- `Fit` gains a `commentCount` field (default 0; old fits read as 0).

## Apply
Copy the files in this zip over the matching paths in the
`se_project_express` repo (same relative paths — `models/`,
`controllers/`, `routes/`, `middlewares/`). No new dependencies.

## Deploy
Commit + push to GitHub — Render redeploys the service automatically.
Deploy the backend FIRST: until it is live, the app shows the
"coming soon" states for comments/posts instead of crashing.

## Verify (after deploy)
- `GET https://se-project-express-5lx6.onrender.com/posts` → `[]`
- `GET https://se-project-express-5lx6.onrender.com/comments?targetType=fit&targetId=<any 24-hex id>` → `[]`
- Post a comment from the app on any fit; the count on the card goes up by 1.
