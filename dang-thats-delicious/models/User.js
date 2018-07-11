const mongoose = require('mongoose');
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

// agrega las campos y metodos que no se definieron en el schema del usuario
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply en email address',
  },
  name: {
    type: String,
    require: 'Please supply a name',
    trim: true,
  },
});

// Virtual field. En mongodb es un campo que puede ser generado sin necesidad de definirlo en el schema, en lugar de tener que guardar en la base de datos
// Crear campo virtual
userSchema.virtual('gravatar').get(function () {
  // gravatar usa el algoritmo "mp5". Toma el email del usuario y lo hashea
  const hash = md5(this.email);

  return `https://gravatar.com/avatar/${hash}?s=200`

});


// Agregar plugin al schema
// agregar todos los metodos y campos necesarios para permitir autenticacion al schema. 'email' es el campo de login
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
// Transformar los errores por default de mongo en mensajes amigables
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
