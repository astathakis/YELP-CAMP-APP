const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//boilerplate for our views
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

//router campgrounds
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.set('strictQuery', true);

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  //mongoose 6 no longer support useNewUrlParser,useCreateIndex,useUnifiedTopology
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
app.use(express.urlencoded({ extended: true }));

// express.urlencoded({ extented: true });
//method-override
app.use(methodOverride('_method'));
//serving static files
app.use(express.static('public'));
app.set(express.static(path.join(__dirname, 'public')));

//session initial config
const sessionConfig = {
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //after a week milisecs
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//+++++++++++++Set up our REST routes+++++++++++

app.use('/campgrounds', campgrounds);
//you should provide this id with merge params in reviews router to have access since routes have their own params
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
  res.render('home');
});

// for every single req and every path
app.all('*', (req, res, next) => {
  // res.send('404!!!');
  next(new ExpressError('page not found!!!', 404));
});

// owr own error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  // console.log(err);
  // res.status(statusCode).send(message);

  // // ==============error template==========
  if (!err.message) err.message = 'Oh no, something went wrong';
  res.status(statusCode).render('error', { err });
});

// +++++++++++listen on port 3000++++++++++++
app.listen(3000, () => {
  console.log('Serving on port 3000');
});
