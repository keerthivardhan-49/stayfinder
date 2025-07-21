const express=require("express");
const router=express.Router({mergeParams:true});

//require models
const Listing = require('../Models/listing.js');
const Review =require("../Models/review.js");
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError= require("../utils/ExpressError.js");

//ALL MIDDLEWARES ARE STORED IN middleware.js file
const {isLoggedIn, isOwner,validateListing,validateReview, isAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviewController.js");


//-----------------------------------------"Validation of Review is done by validateReview MIDDLEWARE"------------
// ---------------Here isLoggedIn is used to check user is logged in or not to prevent from postman request--------------------------
// Review routes

// Post Review Route
//Passing validateReview as a Middleware
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.postReview));

// Delete Review Route
router.delete("/:reviewId",isLoggedIn,isAuthor, wrapAsync(reviewController.deleteReview));

module.exports= router;