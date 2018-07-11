// Paquete para manejar el logueo
const passport = require('passport');

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
}

// Middleware. Verificar si el usuario esta logueado
exports.isLoggedIn = (req, res, next) => {
  // 1. Check if user is authenticated
  if (req.isAuthenticated()) {
    next(); // he is logged in
    return;
  } else {
    req.flash('error', 'Oops you must be logged in to do that');
    res.redirect('/login');
  }
}