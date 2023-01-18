module.exports.isLoggedIn = (req, res, next) => {
  // passport provides req.user
  console.log('Req.User..', req.user);
  if (!req.isAuthenticated()) {
    /*we want the original for the session
    store the url they are requesting
    remember statefullness to our request
    returnTo helper method*/

    console.log(req.path, req.originalUrl);
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'you must be signed in!!!');
    return res.redirect('/login');
  }
  next();
};
