const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now()
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'you must supply coordinates'
    }],
    address: {
      type: String,
      required: 'you must supply an address'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  // explicitely ask for the virtual fields to be in the json or object when build
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// define indexes
storeSchema.index({ name: 'text', description: 'text' });

// location is  geospatial data
storeSchema.index({ location: '2dsphere' });

// this function will execute every time before every save
storeSchema.pre('save', async (next) => {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegex });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

storeSchema.statics.getTagsList = function () {
  // we don't use arrow function here, because we neeed to use the this keyword to bind the properties
  return this.aggregate([
    { $unwind: '$tags' }, // creates an instance of the object for each value it has in tags
    { $group: { _id: '$tags', count: { $sum: 1 } } }, // group by tag and sum the number of tags
    { $sort: { count: -1 } }
  ]);
};

// get the top stores
storeSchema.statics.getTopStores = function () {
  return this.aggregate([
    // lookup stores an populate their reviews
    {
      $lookup: {
        from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'
      }
    },
    // filter stores with 2 or more reviews
    { $match: { 'reviews.1': { $exists: true } } },
    // add the average review field
    { $addFields: { averageRating: { $avg: '$reviews.rating' } } },
    // sort it by the everage
    { $sort: { averageRating: -1 } },
    // limit to 10
    { $limit: 10 }
  ]);
};

// find the reviews of the store
storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id', // field on the store
  foreignField: 'store' // field on the review
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
