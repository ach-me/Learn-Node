const mongoose = require('mongoose');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

// Middleware
exports.validateRegister = (req, res, next) => {
  // 1. Sanitize name
  // "sanitizeBody" esta disponible en cada request realizado, gracias al paquete "expressValidator" declarado en "app.js"
  req.sanitizeBody('name');
  // 2. Verificar que no este vacio
  req.checkBody('name', 'You must supply a name!').notEmpty();
  // 3. Verificar email valida
  req.checkBody('email', 'That email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  // 4. Password no es vacio
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  // 5. Verificar que los passwords sean iguales
  req.checkBody('password-confirm', 'Oops! Your passwords do not match!').equals(req.body.password);

  // Get validation errors if there is any
  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop fn from running
  }
  next(); // there were no errors
};
