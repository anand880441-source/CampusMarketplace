const mongoose = require("mongoose");
const User = require("../models/User");
const Listing = require("../models/Listing");

const validateId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      populate: { path: "seller", select: "name college" },
    });

    const favorites = (user.favorites || []).filter(Boolean);
    const validIds = favorites.map((listing) => listing._id);

    if (validIds.length !== (user.favorites || []).length) {
      user.favorites = validIds;
      await user.save();
    }

    const data = favorites.map((listing) => {
      const item = listing.toObject();
      item.isAvailable = listing.isActive && listing.status === "available";
      return item;
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    if (!validateId(req.params.listingId)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const listing = await Listing.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favorites: listing._id },
    });

    res.status(200).json({ success: true, message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    if (!validateId(req.params.listingId)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favorites: req.params.listingId },
    });

    res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
