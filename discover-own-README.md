# Discover: include your own public photos — backend fix v1

## What changes
`controllers/galleryItem.js` — `getPublicGalleryItems` no longer excludes the
requesting user's own photos. Discover now returns ALL public album photos,
newest first, including yours. Before this change it only showed other
people's public photos, so while you are the only user sharing, Discover
stayed empty even after you made a photo public.

Trade-off: once other people join and share, your own public photos will
appear mixed in with theirs in Discover. That is normal for a young feed;
the exclusion can be put back later if you want Discover to be others-only.

## Apply (backend repo on your PC)
1. Extract into `C:\Users\delta\Documents\wtwr-app\se_project_express`
   (the FitCheck backend repo — NOT the FitCheck app repo).
2. Choose Replace for `controllers\galleryItem.js`.
3. Commit + push, e.g.:
   `git add controllers/galleryItem.js`
   `git commit -m "Discover: include own public photos"`
   `git push`
4. Render redeploys the service automatically. Wait for the deploy to finish
   (a minute or two), then pull down in the app and check Discover — your
   public photo should appear there.

## Note
Making a photo public still does NOT create a Community post — posts only
come from Share to community. Discover is the photo grid; the Community
tab (battles) is the post feed.
