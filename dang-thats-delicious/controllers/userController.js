const mongoose = require('mongoose');

// Se puede definir de esta manera porque ya se ha importado en "app.js"
const User = mongoose.model('User');

const promisify = require('es6-promisify');

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

exports.register = async (req, res, next) => {
  // Create the user
  // en este momento se dispone de todos los datos enviados por el formulario en "req.body"
  const user = new User({ email: req.body.email, name: req.body.name });

  // "register()" esta disponible al usar el plugin "passportLocalMongoose" definido en el modelo "User.js"
  // este metodo se encargara directamente de los pasos de registro
  // como este paquete (passport-local-mongoose) no usa promesas, hay que pasarle una funcion callback como 3er parametro
  // User.register(user, req.body.password, function(err, user) {});
  // Para poder utilizarlo como promesa, se usa el paquete "es6-promisify" que permitirá simular asincronismo

  const register = promisify(User.register, User);

  // El password ya se guarda hasheada
  await register(user, req.body.password);
  next(); // pass to authController login
};


exports.account = (req, res) => {
  res.render('account', { title: 'Edit your account' })
}

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );

  req.flash('success', 'Profile updated!')
  // Se puede redirigir a la pagina anterior 
  res.redirect('back')
}