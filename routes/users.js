const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

//render a form
router.get('/register', (req, res) => {
  res.render('users/register');
});
router.post(
  '/register',
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      //login user as soon as is registered - minor
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
      });
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('register');
    }
    // console.log(registeredUser);
  })
);

//serving form
router.get('/login', (req, res) => {
  res.render('users/login');
});
//passport magic use authenticate middleware
//can have multiple strategies defined in different routes
router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
    //this is needed to store session originalurl
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash('success', 'welcome back!');
    //also possible to have returnedTo with nothing
    // console.log(req.session.returnTo);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// router.get('/logout', (req, res) => {
//   req.logout();
//   req.flash('success', 'successfully logged out!!!');
//   res.redirect('/campgrounds');
// });

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'successfully logged out!!!');
    res.redirect('/campgrounds');
  });
});

module.exports = router;
