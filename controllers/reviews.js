const Campground = require('../models/campground');
const Review = require('../models/review')

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'successfully made review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    //we use pull operator of mongo to delete that in array of ids
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })//reviews is array in campground schema
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}