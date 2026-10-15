# DripCast birthday-gate patch (`dob-gate.patch`)

Adds date-of-birth / age-gating support to the DripCast backend (`se_project_express`).
The app uses the derived `isAdult` flag (17+) to pick which hero-art set a user sees.

## Apply order (matters)

1. `backend-social.patch` (from `dripcast-backend-patch/`) — **must be applied first**
2. `dob-gate.patch` (this patch) — **second**

Both were built against commit `68d30b5` ("Add /gallery routes for Album feature").

```bash
cd /path/to/se_project_express   # your wtwr-express clone
git apply /path/to/backend-social.patch
git apply --check /path/to/dob-gate.patch   # should print nothing = clean
git apply /path/to/dob-gate.patch
git add -A && git commit -m "Add birthday gate (dob + isAdult)"
git push   # Render redeploys on push
```

No new npm dependencies, no migrations (Mongoose schemata are code-only),
no new env vars. Rollback: `git revert` the commit.

## What changed

| File | Change |
|---|---|
| `utils/age.js` | **New.** `isAdultDob(dob)` — 17+ check using UTC calendar-date math (timezone-safe). Missing/unparseable DOB → `false` (safe default). |
| `models/user.js` | New optional `dob: Date` field. Schema validator rejects future/unparseable dates. Optional on purpose: existing users keep working without one. |
| `middlewares/validation.js` | `dob` added to signup validation: `Joi.date().less("now").required()` → 400 on missing, future, or unparseable values. New `validateDobUpdate` (same rule) for the update endpoint. |
| `controllers/user.js` | `createUser` accepts `dob`, strips raw `dob` + `password` from the response, adds `isAdult`. `login` response is now `{ token, isAdult }`. `getCurrentUser` adds `isAdult` (the user themself still sees their own `dob` here). New `updateDob` controller. |
| `routes/user.js` | New `PATCH /users/me/dob` (auth-guarded via the `/users` mount). |

## Endpoints

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/signup` | no | `name, avatar, email, password, dob` (dob: ISO date string, past) | `201 { data: { _id, name, avatar, email, isAdult } }` — raw `dob` never returned |
| `POST` | `/signin` | no | `email, password` | `200 { token, isAdult }` |
| `GET` | `/users/me` | yes | — | user object incl. own `dob` + `isAdult` |
| `PATCH` | `/users/me/dob` | yes | `{ dob }` (same validation as signup) | `200 { data: { …, dob, isAdult } }` |
| `GET` | `/users/:id/public` | no | — | unchanged: only `_id, name, avatar` — `dob` can never leak here |

Validation failures return `400` (celebrate `errors()` middleware, same as every
other endpoint). Unknown user on `PATCH /users/me/dob` returns `404`.

## Privacy notes

- Raw `dob` is exposed **only** on `GET /users/me` (the user's own record).
- Signup/signin responses carry only the derived `isAdult` boolean.
- Public profiles (`GET /users/:id/public`) select `_id, name, avatar` only.
- Users created before this patch have no `dob` → `isAdult: false` until they
  call `PATCH /users/me/dob`.

## Verify with curl (against the Render URL after redeploy)

```bash
BASE=https://se-project-express-5lx6.onrender.com

# 1. Signup as an adult
curl -s -X POST $BASE/signup -H 'Content-Type: application/json' -d '{
  "name": "Gate Test", "avatar": "https://example.com/a.png",
  "email": "gatetest@example.com", "password": "password123",
  "dob": "1990-05-20"
}'
# expect 201, data.isAdult == true, no "dob" key in data

# 2. Signup with a future dob -> 400
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/signup -H 'Content-Type: application/json' -d '{
  "name": "Gate Test", "avatar": "https://example.com/a.png",
  "email": "future@example.com", "password": "password123",
  "dob": "2030-01-01"
}'
# expect 400

# 3. Signup missing dob -> 400
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/signup -H 'Content-Type: application/json' -d '{
  "name": "Gate Test", "avatar": "https://example.com/a.png",
  "email": "nodob@example.com", "password": "password123"
}'
# expect 400

# 4. Signin -> token + isAdult
TOKEN=$(curl -s -X POST $BASE/signin -H 'Content-Type: application/json' -d '{
  "email": "gatetest@example.com", "password": "password123"
}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 5. /users/me shows own dob + isAdult
curl -s $BASE/users/me -H "Authorization: Bearer $TOKEN"
# expect isAdult == true and a "dob" field

# 6. Flip to a minor dob -> isAdult becomes false
curl -s -X PATCH $BASE/users/me/dob -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" -d '{ "dob": "2015-06-01" }'
# expect 200, data.isAdult == false

# 7. Public profile still leaks nothing
UID=$(curl -s $BASE/users/me -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])")
curl -s $BASE/users/$UID/public
# expect only _id, name, avatar
```
