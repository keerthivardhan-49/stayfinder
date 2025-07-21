
const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listingController.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ========================
// Index route
// ========================
router.get("/", wrapAsync(listingController.index));

// ========================
// Filter by category
// ========================
// Filter listings by category
router.get("/filter", wrapAsync(listingController.filterByCategory));


// ========================
// Render new listing form
// ========================
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ========================
// Create new listing
// ========================
router.post(
    "/",
    isLoggedIn,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.storeListingData)
);

// ========================
// Show specific listing
// ========================
router.get("/:id", wrapAsync(listingController.showListing));

// ========================
// Render edit form
// ========================
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// ========================
// Update listing
// ========================
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.storeEditedData)
);

// ========================
// Delete listing
// ========================
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;



// | Function Name      | Purpose                                                 |
// | ------------------ | ------------------------------------------------------- |
// | `index`            | Fetch and display all listings (`GET /listings`)        |
// | `renderNewForm`    | Show form to create a new listing (`GET /listings/new`) |
// | `storeListingData` | Save new listing to DB (`POST /listings`)               |
// | `showListing`      | Show a specific listing (`GET /listings/:id`)           |
// | `renderEditForm`   | Show edit form for a listing (`GET /listings/:id/edit`) |
// | `storeEditedData`  | Update the listing in DB (`PUT /listings/:id`)          |
// | `deleteListing`    | Delete the listing from DB (`DELETE /listings/:id`)     |
