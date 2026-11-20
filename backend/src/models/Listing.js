const mongoose = require("mongoose");
const {
  CATEGORIES,
  CONDITIONS,
  LISTING_TYPES,
  LISTING_STATUSES,
} = require("../utils/constants");

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, enum: CATEGORIES, required: true },
    condition: { type: String, enum: CONDITIONS, required: true },
    listingType: { type: String, enum: LISTING_TYPES, default: "sale" },
    images: { type: [String], default: [] },
    status: { type: String, enum: LISTING_STATUSES, default: "available" },
    isActive: { type: Boolean, default: true },
    location: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

listingSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 5, description: 1 } }
);
listingSchema.index({ status: 1, isActive: 1, category: 1, createdAt: -1 });
listingSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model("Listing", listingSchema);
