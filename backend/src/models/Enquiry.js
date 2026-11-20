const mongoose = require("mongoose");
const { ENQUIRY_STATUSES } = require("../utils/constants");

const enquirySchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    offerPrice: { type: Number, default: null, min: 0 },
    status: {
      type: String,
      enum: ENQUIRY_STATUSES,
      default: "pending",
    },
    responseMessage: { type: String, trim: true, maxlength: 500, default: "" },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

enquirySchema.index({ seller: 1, status: 1, createdAt: -1 });
enquirySchema.index({ buyer: 1, createdAt: -1 });
enquirySchema.index({ listing: 1, buyer: 1, status: 1 });

module.exports = mongoose.model("Enquiry", enquirySchema);
