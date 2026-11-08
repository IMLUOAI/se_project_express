const mongoose = require("mongoose");
const GalleryItem = require("../models/galleryItem");
const Comment = require("../models/comment");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");
const { uploadToR2, deleteFromR2 } = require("../utils/r2");
const { parsePagination } = require("../utils/pagination");

// Public shape: owner is populated so Discover cards can render without
// extra fetches.
const galleryPopulate = [{ path: "owner", select: "_id name avatar" }];

module.exports.getGalleryItems = (req, res, next) => {
  GalleryItem.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .then((items) => res.status(200).send(items))
    .catch(next);
};

// getPublicGalleryItems (auth, signed-in users only). Public album photos
// from OTHER users, newest first — the Discover feed. Own items are
// excluded; they live under GET /gallery.
module.exports.getPublicGalleryItems = (req, res, next) => {
  const { limit, page } = parsePagination(req.query);
  return GalleryItem.find({ isPublic: true, owner: { $ne: req.user._id } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(galleryPopulate)
    .then((items) => res.status(200).json(items))
    .catch(next);
};

// setGalleryVisibility (auth, owner only). Flip one item public/private.
module.exports.setGalleryVisibility = async (req, res, next) => {
  const { id } = req.params;
  const { isPublic } = req.body;
  const userId = req.user._id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid gallery item ID"));
    }
    const item = await GalleryItem.findById(id).orFail(() => {
      throw new NotFoundError("Gallery item not found");
    });
    if (item.owner.toString() !== userId) {
      throw new ForbiddenError("Forbidden");
    }
    item.isPublic = isPublic;
    await item.save();
    return res.status(200).send({ data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data passed"));
    }
    return next(err);
  }
};

// likeGalleryItem (mirrors likeFit)
module.exports.likeGalleryItem = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid gallery item ID"));
    }
    const item = await GalleryItem.findByIdAndUpdate(
      id,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).orFail(() => {
      throw new NotFoundError("Gallery item not found");
    });
    return res.status(200).send({ message: "Gallery like was created", data: item });
  } catch (err) {
    return next(err);
  }
};

// dislikeGalleryItem (mirrors dislikeFit)
module.exports.dislikeGalleryItem = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid gallery item ID"));
    }
    const item = await GalleryItem.findByIdAndUpdate(
      id,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).orFail(() => {
      throw new NotFoundError("Gallery item not found");
    });
    return res.status(200).send({ message: "Gallery like was removed", data: item });
  } catch (err) {
    return next(err);
  }
};

module.exports.createGalleryLink = (req, res, next) => {
  const { kind, url, title } = req.body;
  const owner = req.user._id;

  return GalleryItem.create({ kind, url, title, owner, source: "link" })
    .then((item) => res.status(201).send({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data passed"));
      }
      return next(err);
    });
};

module.exports.uploadGalleryFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("No file was uploaded");
    }

    const { buffer, mimetype } = req.file;
    const owner = req.user._id;
    const kind = mimetype.startsWith("video") ? "video" : "photo";
    const title = req.body.title || "";

    const { key, url } = await uploadToR2(buffer, mimetype, owner);

    const item = await GalleryItem.create({
      kind,
      source: "upload",
      url,
      key,
      mimeType: mimetype,
      title,
      owner,
    });

    return res.status(201).send({ data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data passed"));
    }
    return next(err);
  }
};

module.exports.deleteGalleryItem = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid gallery item ID"));
  }

  return GalleryItem.findById(id)
    .orFail(() => {
      throw new NotFoundError("Gallery item not found");
    })
    .then(async (item) => {
      if (item.owner.toString() !== userId) {
        throw new ForbiddenError("Forbidden");
      }
      if (item.source === "upload") {
        await deleteFromR2(item.key);
      }
      return GalleryItem.findByIdAndRemove(id);
    })
    .then((item) => Comment.deleteMany({ targetType: "gallery", targetId: id }).then(() => item))
    .then((item) => {
      res.status(200).send({ message: "Gallery item deleted", data: item });
    })
    .catch(next);
};
