const express = require('express');
//mergeParams fix access to all params express thing!!!
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const Campground = require('../models/campground');
const Review = require('../models/review');

// +++++++++++++review route associated with campground++++

router.post(
  '/',
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    // res.send('you made it!!!');
    const campground = await Campground.findById(req.params.id);
    // console.log(req.params);
    const review = new Review(req.body.review);
    //accosiate review with user like in campgrounds
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'successfully added a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    /*using $pull operator from mongoose to delete the ref
     to the review in the array of objects*/
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    // res.send('delete me!!');
    req.flash('success', 'delete review done!!');
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
