const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failured Login',
  successRedirect: '/',
  successFlash: 'You are now logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'You must be logged in to do that');
  res.redirect('/login');
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    req.flash('error', 'A password reset has been emailed to you');
    return res.redirect('/login');
  }
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  await mail.send({ user, subject: 'Password Reset', resetURL, filename: 'password-reset'});

  req.flash('success', 'A password reset has been emailed to you');

  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset token invalid or expired');
    return res.redirect('/login');
  }

  res.render('reset', { title: 'Reset Password' });
};

exports.changePassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset token invalid or expired');
    return res.redirect('/login');
  }

  const setPasswordPromise = promisify(user.setPassword, user);
  await setPasswordPromise(req.body.password);
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  const updatedUser = await user.save();

  await req.login(updatedUser);
  req.flash('success', 'Password changed')
  res.redirect('/');
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['confirm-password']) {
    next();
    return;
  }
  req.flash('error', 'The password do not match');
  req.redirect('back');
};