// Mongodb es la base de datos
// Monsoose es un paquete para intereaccionar con la base
// Mongodb puede ser usado con cualquier lenguaje, python, ruby, php
// Mongoose es la forma de interaccionar mas popular con mongodb
const mongoose = require('mongoose');

// Hay varias maneras de esperar por los datos de la base
mongoose.Promise = global.Promise;

// Libreria para hacer las url mas amigables
const slug = require('slugs');

// Hacer el schema
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String]
});

// Antes de guardar el store
storeSchema.pre('save', function (next) {
  // cuando el nombres es cambiado
  if (!this.isModified('name')) {
    next(); // skip it
    return;
  }
  // tomar el nombre, pasarlo por el paquete slug
  this.slug = slug(this.name);
  next(); 
});

// Si lo que se importara es lo principal
module.exports = mongoose.model('Store', storeSchema);