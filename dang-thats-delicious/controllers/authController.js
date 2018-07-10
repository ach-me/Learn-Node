// Paquete para manejar el logueo
const passport = require('passport');

// Middleware
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFalsh: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!',
});
