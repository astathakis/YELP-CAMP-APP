const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//boilerplate for our views
const ejsMate = require('ejs-mate');

const { campgroundSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

mongoose.set('strictQuery', true);

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  //mongoose 6 no longer support useNewUrlParser,useCreateIndex,useUnifiedTopology
  //   they are set to true from the the start
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

// ++++++++++++++++++++template engine++++++++++
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//enable to parse the body of the request
app.use(express.urlencoded({ extented: true }));
//method-override
app.use(methodOverride('_method'));

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

//+++++++++++++Set up our REST routes+++++++++++

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

// +++create new camp has two route handlers++++++
// one to serve our form
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

// ++++++++++++show route+++++++++++
app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
  })
);

// and one for the post
//including error wrapper

app.post(
  '/campgrounds',
  validateCampground,

  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError('invalid Campground data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    // res.render('home');
  })
);

// +++++++++++edit route++++++++++
//get the id and prepopulated the form with the information
app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  })
);
//faking post request from form with a put request using method-override
app.put(
  '/campgrounds/:id',
  validateCampground,

  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// +++++++++++++++delete route+++++++++
app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  })
);

// for every single req and every path
app.all('*', (req, res, next) => {
  // res.send('404!!!');
  next(new ExpressError('page not found!!!', 404));
  // next();
  // console.log('this is ...');
  // throw new ExpressError('page not found', 404);
  // throw new ExpressError('page not found express!!', 404);
});

// app.use((err, req, res, next) => {
//   console.log(err.name);
//   next(err);
// });

// owr own error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  console.log(err);
  // res.status(statusCode).send(message);

  // // ==============error template========================
  if (!err.message) err.message = 'Oh no, something went wrong';
  res.status(statusCode).render('error', { err });

  // res.send(message);
  // console.log('testing..');
  // next();
  // res.send('oh, something is wrong');
});

// +++++++++++listen on port 3000++++++++++++
app.listen(3000, () => {
  console.log('Serving on port 3000');
});
