const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const Enquiry = require("../models/Enquiry");
const Notification = require("../models/Notification");
const User = require("../models/User");
const {
  CATEGORIES,
  CONDITIONS,
  LISTING_TYPES,
  LISTING_STATUSES,
} = require("../utils/constants");
const {
  getPagination,
  paginationMeta,
  escapeRegex,
  publicUser,
} = require("../utils/helpers");
const {
  closePendingEnquiries,
  notifyAcceptedBuyersSold,
} = require("../utils/enquiryFlow");
const {
  listingCreateSchema,
  listingUpdateSchema,
  listingStatusSchema,
} = require("../utils/validations");

const validateId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getListings = async (req, res) => {
  try {
    const { search, category, condition, listingType, minPrice, maxPrice, location, sort } =
      req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { isActive: true, status: "available" };

    if (category && CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (condition && CONDITIONS.includes(condition)) {
      filter.condition = condition;
    }
    if (listingType && LISTING_TYPES.includes(listingType)) {
      filter.listingType = listingType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== "" && !Number.isNaN(Number(minPrice))) {
        priceFilter.$gte = Number(minPrice);
      }
      if (maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
        priceFilter.$lte = Number(maxPrice);
      }
      if (Object.keys(priceFilter).length > 0) {
        filter.price = priceFilter;
      }
    }

    if (location && String(location).trim()) {
      filter.location = {
        $regex: escapeRegex(String(location).trim()),
        $options: "i",
      };
    }

    const searchText = typeof search === "string" ? search.trim() : "";
    if (searchText) {
      filter.$text = { $search: searchText };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOption = { price: 1, createdAt: -1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "relevance" && searchText) {
      sortOption = { score: { $meta: "textScore" }, createdAt: -1 };
    }

    let query = Listing.find(filter)
      .populate("seller", "name college")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    if (sort === "relevance" && searchText) {
      query = query.select({ score: { $meta: "textScore" } });
    }

    const [listings, total] = await Promise.all([
      query,
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

exports.getListingById = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "name email phone college course profileImage contactPreference createdAt"
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const data = listing.toObject();
    const seller = publicUser(listing.seller);
    if (seller) {
      delete seller.contact;
    }
    data.seller = seller;

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSimilarListings = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const similar = await Listing.find({
      _id: { $ne: listing._id },
      category: listing.category,
      status: "available",
      isActive: true,
    })
      .populate("seller", "name college")
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({ success: true, data: similar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    const parsed = listingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check the listing details",
        errors: parsed.error.issues,
      });
    }

    const data = parsed.data;
    if (data.listingType !== "sale") {
      data.price = 0;
    }

    const listing = await Listing.create({
      ...data,
      seller: req.user._id,
    });

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (String(listing.seller) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only edit your own listings" });
    }

    const parsed = listingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check the listing details",
        errors: parsed.error.issues,
      });
    }

    const update = parsed.data;
    const listingType = update.listingType || listing.listingType;

    if (listingType !== "sale") {
      update.price = 0;
    }

    const updated = await Listing.findByIdAndUpdate(listing._id, update, {
      new: true,
      runValidators: true,
    });

    if (update.isActive === false) {
      await closePendingEnquiries(updated, "The seller paused this listing.");
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateListingStatus = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const parsed = listingStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing status",
        errors: parsed.error.issues,
      });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (String(listing.seller) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only update your own listings" });
    }

    const requestedStatus = parsed.data.status;

    if (requestedStatus === "reserved") {
      await closePendingEnquiries(
        listing,
        "The seller reserved this item for another buyer."
      );
    }

    if (requestedStatus === "sold") {
      await closePendingEnquiries(
        listing,
        "The seller marked this item as sold."
      );
      await notifyAcceptedBuyersSold(listing);
    }

    listing.status = requestedStatus;
    await listing.save();

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { seller: req.user._id };
    if (status && LISTING_STATUSES.includes(status)) {
      filter.status = status;
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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

exports.deleteListing = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (String(listing.seller) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only delete your own listings" });
    }

    await Promise.all([
      Listing.deleteOne({ _id: listing._id }),
      Enquiry.deleteMany({ listing: listing._id }),
      Notification.deleteMany({ listing: listing._id }),
      User.updateMany({ favorites: listing._id }, { $pull: { favorites: listing._id } }),
    ]);

    res.status(200).json({ success: true, message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
