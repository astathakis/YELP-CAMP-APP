const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

//build validation middleware (server side)
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  //error.details is an array of objects
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
  // console.log(error);
};

router.get(
  '/',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

// +++create new camp has two route handlers++++++
// one to serve our form
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// ++++++++++++show route+++++++++++
router.get(
  '/:id',

  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      'reviews'
    );
    // console.log(campground);
    if (!campground) {
      req.flash('error', 'campground does not exist!!!');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
  })
);

// and one for the post
//including error wrapper

router.post(
  '/',
  isLoggedIn,
  validateCampground,

  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError('invalid Campground data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!!');
    res.redirect(`/campgrounds/${campground._id}`);
    // res.render('home');
  })
);

// +++++++++++edit route++++++++++
//get the id and prepopulated the form with the information
//no need to use merger params here cause id is defined within our router in the path
router.get(
  '/:id/edit',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash('error', 'cannot edit campground does not exist!!!');
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
  })
);
//faking post request from form with a put request using method-override
router.put(
  '/:id',
  isLoggedIn,
  validateCampground,

  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', 'successfully updated campground!!!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// +++++++++++++++delete route+++++++++
router.delete(
  '/:id',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'campground deleted!!!');
    res.redirect('/campgrounds');
  })
);

module.exports = router;
