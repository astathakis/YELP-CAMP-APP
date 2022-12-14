// ************independant seed file *******************

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// mongoose.set('strictQuery', true);

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  //mongoose 6 no longer support
  //   useNewUrlParser: true,
  //   useCreateIndex: true,
  //   useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

//this is to use seedHelpers -pass in the array and return a random element of the array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//function to empty db and then seed our db
const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/random?camp ',

      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad earum sint, quisquam dolorem nulla libero amet quidem quasi dolor aperiam?',
      price,
    });
    await camp.save();
  }
};

//after seeding just close the connection
seedDb().then(() => {
  mongoose.connection.close();
});
