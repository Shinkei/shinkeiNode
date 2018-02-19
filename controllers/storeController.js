const mongoose = require('mongoose');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const Store = mongoose.model('Store');
const User = mongoose.model('User');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That file type is not allowed' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index', { name: 'perro', title: 'home' });
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: '💩 Add Store' });
};

// middleware to validate the images
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = new Store(req.body);
  await store.save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it');
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  confirmOwner(store, req.user);
  res.render('editStore', { title: `Edit 💩 ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';

  const store = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  ).exec();
  req.flash('success', `${store.name} successfully edited <a href="/stores/${store.slug}">View Store -></a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (!store) {
    next();
    return;
  }
  res.render('store', { title: store.name, store });
};

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  // executes 2 promises at the same time an waits for them to finish
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tags', {
    title: 'Tags', tags, tag, stores
  });
};

exports.searchStores = async (req, res) => {
  const stores = await Store
    .find({ $text: { $search: req.query.q } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
  res.json(stores);
};

// this function has the porpuse to show how to get values fron the get url
exports.echoed = (req, res) => {
  if (Object.keys(req.query).length === 0) {
    res.send('try to send parameters in the url, eg: echoed?param1=value1&param2=value2');
  }
  res.send(req.query);
};

// this function reverse the given name in the url
exports.reverse_name = (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
};


exports.mapStores = async (req, res) => {
  const coordinates = [+req.query.lng, +req.query.lat];
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000
      }
    }
  };

  const stores = await Store.find(query).select('name slug description location photo').limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
    .findByIdAndUpdate(
      req.user._id, { [operator]: { hearts: req.params.id } },
      { new: true }
    );
  res.json(user);
};
