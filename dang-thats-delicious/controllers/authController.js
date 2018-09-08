// Paquete para manejar el logueo
const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

const User = mongoose.model('User');

// Middleware
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFalsh: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out!');
  res.redirect('/');
};

// Middleware. Verificar si el usuario esta logueado
exports.isLoggedIn = (req, res, next) => {
  // 1. Check if user is authenticated
  if (req.isAuthenticated()) {
    next(); // he is logged in
  } else {
    req.flash('error', 'Oops you must be logged in to do that');
    res.redirect('/login');
  }
};

// Cuando alguien requiere resetear password
exports.forgot = async (req, res) => {
  // 1. See if that user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'A password reset has been mailed to you.');
    return res.redirect('/login');
  }

  // 2. Set resets tokens and expiry on their account
  // crypto permite generar un string random para generar el token
  // Estos dos campos hay que agregarlos al Schema de User.js
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  // Wait until the user is saved
  await user.save();

  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  await mail.send({
    user,
    subject: 'Password reset',
    resetURL,
    filename: 'password-reset',
  });

  // Say the user it has worked
  req.flash('success', 'You have been emailed a password reset link.');

  // 4. Redirect to the login page
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  // res.json(req.params);
  // 1. Check if the token exists
  // Search the user
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }, // "gt" greater than... en MongoDB
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  // 2. Is the token expired
  res.render('reset', { title: 'Reset your password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', 'Passwords do not match');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }, // "gt" greater than... en MongoDB
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  // Actualizar password
  // El metodo "setPassword" esta disponible porque se importo en User.js
  // Como este metodo no retorna una promesa, se utilizar el paquete es6-promisify
  const setPassword = promisify(user.setPassword, user);
  // Set the new password, hash it, salt it...
  await setPassword(req.body.password);

  // Quitar los fields de la base MongoDB
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Para que se vean reflejados estos cambios hay que guardar el usuario
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Your password has been reset');
  res.redirect('/');
};
