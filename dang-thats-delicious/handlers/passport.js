const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('User');

passport.use(User.createStrategy());

// cada vez que se realiza un request, definir que datos se conservar del usuario
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
