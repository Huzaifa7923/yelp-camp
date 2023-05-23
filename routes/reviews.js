const express = require('express')
const router = express.Router({ mergeParams: true })
// for id of reviews bcz review id is not present in this route gives below
//but there is an id in app.js file=app.use('/campgrounds/:id/reviews', reviews)
// so to merge these we use above statement
const catchAsync = require('../utils/catchAsync')

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const reviews = require('../controllers/reviews')

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router