const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");

router.get("/", auth, getFavorites);
router.post("/:listingId", auth, addFavorite);
router.delete("/:listingId", auth, removeFavorite);

module.exports = router;
