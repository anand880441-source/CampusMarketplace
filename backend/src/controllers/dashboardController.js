const Listing = require("../models/Listing");
const Enquiry = require("../models/Enquiry");
const Notification = require("../models/Notification");
const { publicUser } = require("../utils/helpers");

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

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      active,
      reserved,
      sold,
      receivedEnquiries,
      pendingOffers,
      sentEnquiries,
      unreadNotifications,
      recentReceived,
      recentSent,
    ] = await Promise.all([
      Listing.countDocuments({ seller: userId, isActive: true, status: "available" }),
      Listing.countDocuments({ seller: userId, isActive: true, status: "reserved" }),
      Listing.countDocuments({ seller: userId, status: "sold" }),
      Enquiry.countDocuments({ seller: userId }),
      Enquiry.countDocuments({
        seller: userId,
        status: "pending",
        offerPrice: { $ne: null },
      }),
      Enquiry.countDocuments({ buyer: userId }),
      Notification.countDocuments({ user: userId, isRead: false }),
      Enquiry.find({ seller: userId })
        .populate("listing", "title price images status isActive")
        .populate("buyer", "name email phone college contactPreference profileImage")
        .sort({ createdAt: -1 })
        .limit(5),
      Enquiry.find({ buyer: userId })
        .populate("listing", "title price images status isActive")
        .populate("seller", "name email phone college contactPreference profileImage")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          active,
          reserved,
          sold,
          receivedEnquiries,
          pendingOffers,
          sentEnquiries,
          unreadNotifications,
        },
        recentReceived: recentReceived.map(sanitizeEnquiry),
        recentSent: recentSent.map(sanitizeEnquiry),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
