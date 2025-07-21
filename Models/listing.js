const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const User = require("./user");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number
    },
    category: { 
        type: String,
        enum: [
            'Trending',
            'Rooms',
            'Mountains',
            'Camp',
            'House',
            'Beaches',
            'Mountain city',
            'Pool',
            'Forest'
        ],
        required: true
    }, 
    location: {
        type: String
    },
    country: {
        type: String
    },
    contactUs: {
        type: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
