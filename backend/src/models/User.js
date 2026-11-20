const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    college: { type: String, default: "" },
    course: { type: String, default: "" },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    contactPreference: { type: String, enum: ["email", "phone"], default: "email" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isVerified: { type: Boolean, default: false },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);