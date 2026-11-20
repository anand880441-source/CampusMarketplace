const mongoose = require("mongoose");
const User = require("../models/User");
const Listing = require("../models/Listing");
const { LISTING_STATUSES } = require("../utils/constants");
const { getPagination, paginationMeta, publicUser } = require("../utils/helpers");
const { profileUpdateSchema } = require("../utils/validations");

const validateId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.updateMe = async (req, res) => {
  try {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your profile details",
        errors: parsed.error.issues,
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, parsed.data, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSellerProfile = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const user = await User.findById(req.params.id).select(
      "name email phone college course profileImage contactPreference createdAt"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const [available, reserved, sold, total] = await Promise.all([
      Listing.countDocuments({
        seller: user._id,
        isActive: true,
        status: "available",
      }),
      Listing.countDocuments({
        seller: user._id,
        isActive: true,
        status: "reserved",
      }),
      Listing.countDocuments({ seller: user._id, status: "sold" }),
      Listing.countDocuments({ seller: user._id }),
    ]);

    const seller = publicUser(user);
    if (seller) {
      delete seller.contact;
    }

    res.status(200).json({
      success: true,
      data: {
        seller,
        stats: { available, reserved, sold, total },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSellerListings = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const { status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { seller: req.params.id, isActive: true };

    if (status && LISTING_STATUSES.includes(status)) {
      filter.status = status;
    } else if (status === "all") {
      filter.status = { $in: LISTING_STATUSES };
    } else {
      filter.status = { $in: ["available", "reserved"] };
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("seller", "name college")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: listings,
      pagination: paginationMeta(page, limit, total),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
