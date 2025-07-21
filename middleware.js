//we need Listing Model as we are using in this file
const Listing=require("./Models/listing");
const Review=require("./Models/review.js")
const ExpressError= require("./utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");



//using next() because these are middleware
isLoggedIn=(req,res,next)=>{
    
    //Before rendering form we need check weather the user is authenticated or not
    //It checks user info in current session
    if(!req.isAuthenticated()){
        //If user is not logged in then we need to [Save action(storing route info) before login] RedirectUrl save
        req.session.redirectUrl=req.originalUrl;

        req.flash("error","You must be logged in to create listing")
       return res.redirect("/login");
    }
    //if user is authenticated call next
    next();
};

module.exports={isLoggedIn};


module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;

    // ✅ Listing model stores owner as a reference ID.
    // To access full owner details (like _id, username), we need to populate the 'owner' field.
    const listing = await Listing.findById(id).populate("owner");

    // 🔸 Note: We are not in an EJS file, so use res.locals.currUser directly (not just currUser).
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.isAuthor=async(req,res,next)=>{
    //--Here we are getting review id
    let{reviewId,id}=req.params;
// --generally in [Review model we just store refence ID of author to get full details we need to populate author]
    let review=await Review.findById(reviewId).populate("author");;

    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","Your not author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//validates the data given in form is correct with respective to Schema
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        return next(new ExpressError(400, error.details.map(el => el.message).join(", ")));
    } else {
        next();
    }
};



module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        return next(new ExpressError(400, error.details.map(el => el.message).join(", ")));
    } else {
        next();
    }
};
