const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failured Login',
  successRedirect: '/',
  successFlash: 'You are now logged in'
});