const Enquiry = require("../models/Enquiry");
const Notification = require("../models/Notification");

const closePendingEnquiries = async (
  listing,
  reason,
  excludeEnquiryId = null
) => {
  const filter = { listing: listing._id, status: "pending" };

  if (excludeEnquiryId) {
    filter._id = { $ne: excludeEnquiryId };
  }

  const pending = await Enquiry.find(filter).select("_id buyer");

  if (pending.length === 0) {
    return [];
  }

  await Enquiry.updateMany(
    { _id: { $in: pending.map((item) => item._id) } },
    {
      status: "rejected",
      responseMessage: reason,
      respondedAt: new Date(),
    }
  );

  await Notification.insertMany(
    pending.map((item) => ({
      user: item.buyer,
      type: "enquiry_response",
      message: `Your enquiry on "${listing.title}" was closed. ${reason}`,
      listing: listing._id,
      enquiry: item._id,
    }))
  );

  return pending;
};

const notifyAcceptedBuyersSold = async (listing) => {
  const accepted = await Enquiry.find({
    listing: listing._id,
    status: "accepted",
  }).select("_id buyer");

  if (accepted.length === 0) {
    return;
  }

  await Notification.insertMany(
    accepted.map((item) => ({
      user: item.buyer,
      type: "listing_sold",
      message: `"${listing.title}" has been marked as sold. Thanks for using CampusMarket!`,
      listing: listing._id,
      enquiry: item._id,
    }))
  );
};

module.exports = {
  closePendingEnquiries,
  notifyAcceptedBuyersSold,
};
