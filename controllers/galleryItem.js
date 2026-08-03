const mongoose = require("mongoose");
const GalleryItem = require("../models/galleryItem");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");
const { uploadToR2, deleteFromR2 } = require("../utils/r2");

module.exports.getGalleryItems = (req, res, next) => {
  GalleryItem.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .then((items) => res.status(200).send(items))
    .catch(next);
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
    .then((item) => {
      res.status(200).send({ message: "Gallery item deleted", data: item });
    })
    .catch(next);
};
