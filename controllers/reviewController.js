const Listing=require("../Models/listing");
const Review=require("../Models/review")


module.exports.postReview=async(req,res)=>{
    // here "id" is not present
    let listing=await Listing.findById(req.params.id);
    // inserting data into Review Model and Saving them
    let newReview =new Review(req.body.review);
    // we are creating and adding "author" entity in review SCHEMA
    newReview.author=req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("New Review Saved");
    req.flash("success","New Review Created");
    res.redirect(`/listings/${listing._id}`);//listing class contains _id as key value pair
}

module.exports.deleteReview=async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//Pulling reviewId from review array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`); // note the leading `/`
}