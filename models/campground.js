const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  location: String,
  image: String,
  price: Number,
  description: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

//query mongoose middleware
CampgroundSchema.post('findOneAndDelete', async function (doc) {
  //remove all reviews in the doc just deleted
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
  // console.log(doc);
});

module.exports = mongoose.model('Campground', CampgroundSchema);
