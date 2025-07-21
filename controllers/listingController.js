const Listing = require("../Models/listing");

// Display all listings
module.exports.index = async (req, res) => {
    const alllistings = await Listing.find({}).populate("owner");
    res.render("listings/index.ejs", { alllistings });
};

// Render the form to create a new listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/NewForm.ejs");
};


// Filter listings by category
module.exports.filterByCategory = async (req, res) => {
    const { category } = req.query;
    let filter = {};

    if (category) {
        filter.category = category;
    }

    const filteredListings = await Listing.find(filter).populate("owner");
    res.render("listings/index.ejs", { alllistings: filteredListings });
};


// Store the submitted form data into the database
module.exports.storeListingData = async (req, res, next) => {
    const listingData = req.body.listing;
    const listing = new Listing(listingData);
    listing.owner = req.user._id;

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

// Display a specific listing by ID
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({ path: "reviews", populate: { path: "author" } });

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// Render the form to edit an existing listing
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

// Update the edited listing in the database
module.exports.storeEditedData = async (req, res) => {
    const { id } = req.params;

    // Update listing with form data
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
        new: true,
        runValidators: true
    });

    // Handle image update if a new file is uploaded
    if (req.file) {
        const { path: url, filename } = req.file;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${listing._id}`);
};


// Delete a listing from the database
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted:", deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect('/listings');
};
