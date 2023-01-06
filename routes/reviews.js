const express = require('express');
//mergeParams fix access to all params express thing!!!
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

//joi schema
const { reviewSchema } = require('../schemas.js');

const Campground = require('../models/campground');
const Review = require('../models/review');

// +++++++++++++review route associated with campground++++

//validate middleware
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  '/',
  validateReview,
  catchAsync(async (req, res) => {
    // res.send('you made it!!!');
    const campground = await Campground.findById(req.params.id);
    // console.log(req.params);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'successfully added a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
router.delete(
  '/:reviewId',
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
