const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

// mongoose.set('strictQuery', true);

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//+++++++++++++Set up our REST routes+++++++++++

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

// +++++++++++listen on port 3000++++++++++++
app.listen(3000, () => {
  console.log('Serving on port 3000');
});
