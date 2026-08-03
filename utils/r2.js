const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

// Cloudflare R2 is S3-compatible, so the regular AWS S3 SDK works against it —
// just point it at R2's endpoint instead of AWS's.
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Uploads a file buffer to the bucket under a random, collision-resistant
// key, and returns { key, url } — the url is what gets stored on the
// GalleryItem document and served directly to the frontend.
const uploadToR2 = async (buffer, mimeType, ownerId) => {
  const extension = (mimeType.split("/")[1] || "bin").split("+")[0];
  const key = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  const url = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  return { key, url };
};

const deleteFromR2 = async (key) => {
  if (!key) return;
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
};

module.exports = { uploadToR2, deleteFromR2 };
