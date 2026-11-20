const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createEnquiry,
  getReceivedEnquiries,
  getSentEnquiries,
  getMyEnquiryForListing,
  getEnquiryById,
  respondToEnquiry,
  withdrawEnquiry,
} = require("../controllers/enquiryController");

router.post("/", auth, createEnquiry);
router.get("/received", auth, getReceivedEnquiries);
router.get("/sent", auth, getSentEnquiries);
router.get("/mine/:listingId", auth, getMyEnquiryForListing);
router.get("/:id", auth, getEnquiryById);
router.patch("/:id/respond", auth, respondToEnquiry);
router.patch("/:id/withdraw", auth, withdrawEnquiry);

module.exports = router;
