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
const storeSchema = new mongoose.Schema(
  {
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
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'You must supply an author.',
    },
  },
  {
    // ya que los campos "virtuals" no son incluidos por default en los json u objetos (no esta disponible dentro del objet 'store'), hay que hacerlo explicitamente
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Define our indexes (tema de MongoDB)
// Agregar index. Se indica qué campos del schema queremos que se indexen
// Esto permitira buscar datos en estos campos de manera mas eficiente
storeSchema.index({
  name: 'text',
  description: 'text',
});

// Geospacial data
storeSchema.index({
  location: '2dsphere',
});

// Antes de guardar el store
storeSchema.pre('save', async function(next) {
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
  // Find other stores with same slug
  // RegExp que busque un patron en la base
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  // "this.constructor" es igual a "Store" al momento ejecutarse esta linea
  // Se usa eso porque el modelo está siendo creado a esta altura
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

// Agregar método propio
// Estos metodos estaran ligados al modelo
storeSchema.statics.getTagsList = function() {
  // "aggregate" tomara una array de operadores posibles de lo que se este buscando
  return this.aggregate([
    // con '$tags' se indica que es un campo del documento que se quiere
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

storeSchema.statics.getTopStores = function() {
  // aggregate es como find, pero puede hacer queries mas complejas
  // aggregate retorna una promesa
  return this.aggregate([
    // 1- lookup stores and populate their reviews
    // No puede usarse el virtual definido abajo porque ese es un metodo de mongoose, mientras que aggregate es de mongodb
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews',
      },
    },
    // 2- filter for only items that have 2 or more reviews
    {
      $match: {
        // el numero 1 indica el indice del array reviews. O sea, verifica que existan por lo menos dos elementos en el array (2 reviews)
        'reviews.1': {
          $exists: true,
        },
      },
    },
    // 3- add the average reviews field
    {
      $addFields: {
        // Create a new field called "averageRating"
        averageRating: {
          // Set its value as the average of each of the reviews rating
          $avg: '$reviews.rating',
        },
      },
    },
    // 4- sort it by our new field, hieghest reviews first
    {
      $sort: {
        averageRating: -1,
      },
    },
    // 5- limit to at most 10
    {
      $limit: 10,
    },
  ]);
};

// finds reviews where the stores _id property === reviews store property
// es como un JOIN en SQL
storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store', // which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

// Si lo que se importara es lo principal
module.exports = mongoose.model('Store', storeSchema);
