const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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
// and one for the post
//including error wrapper
app.post(
  '/campgrounds',
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// ++++++++++++show route+++++++++++
app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
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

// owr own error handler
app.use((err, req, res, next) => {
  res.send('oh, something went wrong!');
});

// +++++++++++listen on port 3000++++++++++++
app.listen(3000, () => {
  console.log('Serving on port 3000');
});
