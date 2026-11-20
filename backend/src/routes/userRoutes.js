const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  updateMe,
  getSellerProfile,
  getSellerListings,
} = require("../controllers/userController");

router.patch("/me", auth, updateMe);
router.get("/:id/listings", getSellerListings);
router.get("/:id", getSellerProfile);

module.exports = router;
