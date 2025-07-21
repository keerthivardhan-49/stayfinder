const Joi = require('joi');

// Listing schema
const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        category: Joi.string().valid(
            "Trending",
            "Rooms",
            "Mountains",
            "Camp",
            "House",
            "Beaches",
            "Mountain city",
            "Pool",
            "Forest"
        ).required()
    }).required()
});

// Review schema
const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});

// ✅ Export both in one go
module.exports = {
    listingSchema,
    reviewSchema
};
