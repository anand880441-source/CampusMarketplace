const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getListings,
  getListingById,
  getSimilarListings,
  createListing,
  updateListing,
  updateListingStatus,
  getMyListings,
  deleteListing,
} = require("../controllers/listingController");

router.get("/mine", auth, getMyListings);
router.get("/", getListings);
router.post("/", auth, createListing);
router.get("/:id/similar", getSimilarListings);
router.get("/:id", getListingById);
router.patch("/:id/status", auth, updateListingStatus);
router.patch("/:id", auth, updateListing);
router.delete("/:id", auth, deleteListing);

module.exports = router;
