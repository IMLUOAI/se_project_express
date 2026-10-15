const mongoose = require("mongoose");
const Battle = require("../models/battle");
const Fit = require("../models/fit");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const { parsePagination } = require("../utils/pagination");

// Public shape: both fits come with their items so a battle card renders
// without extra fetches; createdBy is limited to the public profile fields.
const battlePopulate = [
  {
    path: "fitA fitB",
    populate: [
      { path: "owner", select: "_id name avatar" },
      { path: "items", select: "_id name imageUrl weather" },
    ],
  },
  { path: "createdBy", select: "_id name avatar" },
];

// getBattles (public). Query: ?status=open|closed&limit=&page=
module.exports.getBattles = (req, res, next) => {
  const { limit, page } = parsePagination(req.query);
  const filter = {};

  if (req.query.status) {
    if (!["open", "closed"].includes(req.query.status)) {
      return next(new BadRequestError('status must be "open" or "closed"'));
    }
    filter.status = req.query.status;
  }

  return Battle.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(battlePopulate)
    .then((battles) => res.status(200).json(battles))
    .catch(next);
};

// createBattle (auth)
module.exports.createBattle = async (req, res, next) => {
  const { fitA, fitB } = req.body;
  const createdBy = req.user._id;

  try {
    if (fitA === fitB) {
      return next(new BadRequestError("fitA and fitB must be different fits"));
    }

    const fits = await Fit.find({ _id: { $in: [fitA, fitB] } });
    if (fits.length !== 2) {
      return next(new NotFoundError("One or both fits not found"));
    }

    const battle = await Battle.create({ fitA, fitB, createdBy });
    return res.status(201).send({ data: battle });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data passed"));
    }
    return next(err);
  }
};

// voteBattle (auth). One vote per user, enforced atomically: the update only
// applies when the battle is open AND the voter is not already in voters,
// so concurrent double-votes are impossible.
module.exports.voteBattle = async (req, res, next) => {
  const { id } = req.params;
  const { pick } = req.body;
  const userId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid battle ID"));
    }

    const field = pick === "A" ? "votesA" : "votesB";
    const battle = await Battle.findOneAndUpdate(
      { _id: id, status: "open", voters: { $ne: userId } },
      { $inc: { [field]: 1 }, $addToSet: { voters: userId } },
      { new: true }
    );

    if (battle) {
      return res.status(200).send({ message: "Vote recorded", data: battle });
    }

    // The atomic update matched nothing — figure out why for a clear error.
    const existing = await Battle.findById(id);
    if (!existing) {
      return next(new NotFoundError("Battle not found"));
    }
    if (existing.status !== "open") {
      return next(new BadRequestError("Battle is closed"));
    }
    return next(new BadRequestError("You have already voted in this battle"));
  } catch (err) {
    return next(err);
  }
};

// closeBattle (auth, creator only)
module.exports.closeBattle = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid battle ID"));
    }

    const battle = await Battle.findById(id).orFail(() => {
      throw new NotFoundError("Battle not found");
    });
    if (battle.createdBy.toString() !== userId) {
      throw new ForbiddenError("Only the battle creator can close it");
    }

    battle.status = "closed";
    await battle.save();
    return res.status(200).send({ message: "Battle closed", data: battle });
  } catch (err) {
    return next(err);
  }
};
