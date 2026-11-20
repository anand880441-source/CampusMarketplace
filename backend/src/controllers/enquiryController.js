const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");
const Listing = require("../models/Listing");
const Notification = require("../models/Notification");
const { ENQUIRY_STATUSES } = require("../utils/constants");
const { getPagination, paginationMeta, publicUser } = require("../utils/helpers");
const { closePendingEnquiries } = require("../utils/enquiryFlow");
const { enquiryCreateSchema, enquiryResponseSchema } = require("../utils/validations");

const validateId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeEnquiry = (enquiry) => {
  const data = enquiry.toObject ? enquiry.toObject() : { ...enquiry };
  if (data.buyer && typeof data.buyer === "object") {
    data.buyer = publicUser(data.buyer);
  }
  if (data.seller && typeof data.seller === "object") {
    data.seller = publicUser(data.seller);
  }
  return data;
};

exports.createEnquiry = async (req, res) => {
  try {
    const parsed = enquiryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please check the enquiry details",
        errors: parsed.error.issues,
      });
    }

    const { listingId, message, offerPrice } = parsed.data;

    if (!validateId(listingId)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (String(listing.seller) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot enquire about your own listing" });
    }

    if (!listing.isActive || listing.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "This listing is not available for enquiries",
      });
    }

    const existing = await Enquiry.findOne({
      listing: listing._id,
      buyer: req.user._id,
      status: "pending",
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending enquiry for this listing",
      });
    }

    const enquiry = await Enquiry.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      message,
      offerPrice: offerPrice !== undefined ? offerPrice : null,
    });

    await Notification.create({
      user: listing.seller,
      type: "enquiry_received",
      message: `${req.user.name} sent an enquiry on "${listing.title}"`,
      listing: listing._id,
      enquiry: enquiry._id,
    });

    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReceivedEnquiries = async (req, res) => {
  try {
    const { status, offersOnly } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { seller: req.user._id };
    if (status && ENQUIRY_STATUSES.includes(status)) {
      filter.status = status;
    }
    if (offersOnly === "true") {
      filter.offerPrice = { $ne: null };
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate("listing", "title price images status isActive")
        .populate("buyer", "name email phone college contactPreference profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enquiry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: enquiries.map(sanitizeEnquiry),
      pagination: paginationMeta(page, limit, total),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSentEnquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { buyer: req.user._id };
    if (status && ENQUIRY_STATUSES.includes(status)) {
      filter.status = status;
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate("listing", "title price images status isActive")
        .populate("seller", "name email phone college contactPreference profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enquiry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: enquiries.map(sanitizeEnquiry),
      pagination: paginationMeta(page, limit, total),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyEnquiryForListing = async (req, res) => {
  try {
    if (!validateId(req.params.listingId)) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const enquiry = await Enquiry.findOne({
      listing: req.params.listingId,
      buyer: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("listing", "title price images status isActive")
      .populate(
        "seller",
        "name email phone college contactPreference profileImage"
      );

    res.status(200).json({
      success: true,
      data: enquiry ? sanitizeEnquiry(enquiry) : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEnquiryById = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    const enquiry = await Enquiry.findById(req.params.id)
      .populate("listing", "title price images status isActive")
      .populate("buyer", "name email phone college contactPreference profileImage")
      .populate("seller", "name email phone college contactPreference profileImage");

    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    const userId = String(req.user._id);
    if (String(enquiry.buyer._id) !== userId && String(enquiry.seller._id) !== userId) {
      return res.status(403).json({ success: false, message: "You cannot view this enquiry" });
    }

    res.status(200).json({ success: true, data: sanitizeEnquiry(enquiry) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToEnquiry = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    const parsed = enquiryResponseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Please choose accept or reject",
        errors: parsed.error.issues,
      });
    }

    const enquiry = await Enquiry.findById(req.params.id).populate(
      "listing",
      "title status isActive"
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    if (String(enquiry.seller) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the seller can respond to this enquiry" });
    }

    if (enquiry.status !== "pending") {
      return res.status(400).json({ success: false, message: "This enquiry has already been handled" });
    }

    const requestedStatus = parsed.data.status;
    const responseMessage = parsed.data.responseMessage || "";

    if (requestedStatus === "accepted") {
      const listing = await Listing.findById(enquiry.listing._id);

      if (!listing || !listing.isActive) {
        return res.status(400).json({
          success: false,
          message: "This listing is no longer active",
        });
      }

      if (listing.status === "sold") {
        return res.status(400).json({
          success: false,
          message: "This item has already been sold",
        });
      }

      if (listing.status === "reserved") {
        return res.status(400).json({
          success: false,
          message:
            "This listing is already reserved. Reopen it before accepting another offer.",
        });
      }

      listing.status = "reserved";
      await listing.save();

      await closePendingEnquiries(
        listing,
        "The seller accepted another offer, so this item is now reserved.",
        enquiry._id
      );

      await Notification.create({
        user: enquiry.buyer,
        type: "enquiry_response",
        message: `Good news! Your offer on "${listing.title}" was accepted. Check your dashboard for the seller's contact details and arrange pickup.`,
        listing: listing._id,
        enquiry: enquiry._id,
      });
    } else {
      await Notification.create({
        user: enquiry.buyer,
        type: "enquiry_response",
        message: responseMessage
          ? `Your enquiry on "${enquiry.listing.title}" was declined. Seller note: ${responseMessage}`
          : `Your enquiry on "${enquiry.listing.title}" was declined.`,
        listing: enquiry.listing._id,
        enquiry: enquiry._id,
      });
    }

    enquiry.status = requestedStatus;
    enquiry.responseMessage = responseMessage;
    enquiry.respondedAt = new Date();
    await enquiry.save();

    const populated = await Enquiry.findById(enquiry._id)
      .populate("listing", "title price images status isActive")
      .populate(
        "buyer",
        "name email phone college contactPreference profileImage"
      )
      .populate(
        "seller",
        "name email phone college contactPreference profileImage"
      );

    res.status(200).json({ success: true, data: sanitizeEnquiry(populated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.withdrawEnquiry = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    const enquiry = await Enquiry.findById(req.params.id).populate(
      "listing",
      "title"
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    if (String(enquiry.buyer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the buyer can withdraw this enquiry" });
    }

    if (enquiry.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending enquiries can be withdrawn" });
    }

    enquiry.status = "withdrawn";
    await enquiry.save();

    await Notification.create({
      user: enquiry.seller,
      type: "enquiry_response",
      message: `${req.user.name} withdrew their enquiry on "${enquiry.listing.title}".`,
      listing: enquiry.listing._id,
      enquiry: enquiry._id,
    });

    const populated = await Enquiry.findById(enquiry._id)
      .populate("listing", "title price images status isActive")
      .populate(
        "buyer",
        "name email phone college contactPreference profileImage"
      )
      .populate(
        "seller",
        "name email phone college contactPreference profileImage"
      );

    res.status(200).json({ success: true, data: sanitizeEnquiry(populated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
