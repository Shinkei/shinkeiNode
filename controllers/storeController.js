const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index', {name:'perro', title: 'home'});
};

exports.addStore = (req, res) => {
  res.render('editStore', {title: '💩 Add Store'});
};

exports.createStore = async (req, res) => {
  const store = new Store(req.body);
  await store.save();
  res.redirect('/');
};

// this function has the porpuse to show how to get values fron the get url
exports.echoed = (req, res) => {
  if(Object.keys(req.query).length === 0 ){
    res.send('try to send parameters in the url, eg: echoed?param1=value1&param2=value2');
  }
  else{
    res.send(req.query);
  }
};

// this function reverse the given name in the url
exports.reverse_name = (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
};