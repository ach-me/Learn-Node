// Mongodb es la base de datos
// Monsoose es un paquete para intereaccionar con la base
// Mongodb puede ser usado con cualquier lenguaje, python, ruby, php
// Mongoose es la forma de interaccionar mas popular con mongodb
const mongoose = require('mongoose');

// Hay varias maneras de esperar por los datos de la base (sucede de forma asincronica) para poder usar ES6 "async" y "await"
mongoose.Promise = global.Promise;

// Libreria para hacer las url mas amigables. Reemplaza los espacios con "-"
const slug = require('slugs');

// Hacer el schema
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        required: 'You must supply coordinates!',
      },
    ],
    address: {
      type: String,
      required: 'You must supply an address!',
    },
  },
});

// Antes de guardar el store
storeSchema.pre('save', function(next) {
  // se usa sintaxis "function()" para poder acceder a "this"
  // "this" será el Store siende guardado

  // si el stores ya existe, verificar si se está modificando el nombre, para no tener que guardarlo cada vez
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop this function from running

    // tambien es posible hacerlo asi:
    // return next();
  }
  // tomar el nombre, pasarlo por el paquete slug
  this.slug = slug(this.name);
  next();

  /**
   * TODO: make more resiliant so slugs are unique
   */
});

// Si lo que se importara es lo principal
module.exports = mongoose.model('Store', storeSchema);
