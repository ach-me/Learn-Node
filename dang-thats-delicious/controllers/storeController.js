// exports es como variable global. todo lo que se ponga en ella, sera "importable" desde otro archivo
// "req" son los datos que entran
// "res" son los datos que salen
// "next" es necesario en los middleware
// exports.myMiddleware = (req, res, next) => {
//   req.name = 'Wes';
//   res.cookie('name', 'Wes is cool', { maxAge: 90000 });
//   if (req.name === 'Wes') {
//     throw Error('LASKDLAKSLDK');
//   }
//   Terminé con este middleware, seguir con lo que sigue
//   next();
// };

// Para poder trabajar con la base de datos hay que importar mongoose
// Mongoose es el paquete que se usa para interaccionar con la base mongodb
const mongoose = require('mongoose');
// Tambien se necesita una referencia al schema definido en "Store.js"
// En lugar de importarlo directamente de ese archivo
// como se ya se importo en "start.js", -> require('./models/Store');
// se lo puede referenciar a través de mongoose
const Store = mongoose.model('Store');
// La asignacion 'Store' sale del archivo 'Store.js'
// module.exports = mongoose.model('Store', storeSchema);

const User = mongoose.model('User');
// Paquete necesario para el manejo de la transaccion de archivos
const multer = require('multer');

// Paquete para cambiar tamaño de las fotos
const jimp = require('jimp');

// Paquete para hacer nombres de archivos unicos
const uuid = require('uuid');

const multerOptions = {
  // donde sera guardado el archivo
  storage: multer.memoryStorage(),
  // que tipo de archivos estan permitidos
  fileFilter(req, file, next) {
    // Verificar el tipo de archivo
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That file type isn't allowed" }, false);
    }
  },
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  // Mostrar template
  res.render('editStore', {
    title: 'Add Store',
  });
};

// Middleware
// Guardar en la memoria del server (no guarda la foto en la base de datos)
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
  }
  // guardar la extension de la propiedad "mimetype" del objeto "file"
  const extension = req.file.mimetype.split('/')[1];
  // Generar un nombre unico y guardarlo en los datos que seran enviados en "body.post"
  req.body.photo = `${uuid.v4()}.${extension}`;
  // Cambiar tamaño de la foto
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  // Guardarla
  await photo.write(`./public/uploads/${req.body.photo}`);
  // Continuar con el siguiente argumento en router.post('/add', ...)
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  // "req.body" contiene toda la informacion enviada
  // en el formulario
  // res.json(req.body);

  // 'Store' recibe las propiedades con las que fue definido
  // en el scheme del archivo 'Store.js'
  const store = await new Store(req.body).save();

  // Lanza una conexion a la base de datos mongodb y guarda los datos
  // Devuelve los datos guardados o un error
  // Como JS es asincronico por default, va a ejecutar el guardado
  // y seguira con el codigo siguiente. Si hay un error en el guardado
  // no importaría y el usuario no se enteraría que no se guardó.
  // Para evitarlo hay que forzarlo a esperar con promesas
  // Se pueden utilizar promesas porque se indico a mongoose en el
  // archivo 'start.js':
  // mongoose.Promise = global.Promise

  // "flash" esta disponible porque se establecio en "app.js": app.use(flash())
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);

  /**
   * ! esta funcion podria resolverse de esta manera, pero para manejar todos los try catch de la aplicacion se declaró una función que toma como parámetro una función y manejará desde allí los errores. "errorHandlers" en el archivo catchErrors.js
   *
   */
  // try {
  //   const store = new Store(req.body);
  //   await store.save();
  //   res.redirect('/');
  // } catch (error) {
  //   console.log('Lablablabla');
  // }
};

exports.getStores = async (req, res) => {
  // query db for a list of all stores
  // "find()" devuelve una promesa, entonces se espera a que termine con "await"
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

const confirmOwner = (store, user) => {
  // Para comparar un objeto (ObjectId) con un string es necesario usar el metodo "equals"
  if (!store.author.equals(user._id)) {
    throw Error('You must be the owner the store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });

  // 2. Confirm the user is the owner of the store
  confirmOwner(store, req.user);

  // 3. Render out the edit form so the user can update their store
  res.render('editStore', { title: 'Edit Store', store });
};

exports.updateStore = async (req, res) => {
  // Set the location data to be a 'Point'
  // Esto es necesario, ya que al actualizar no se reflejan las propiedades puestas como default
  req.body.location.type = 'Point';

  // 1. Find and update store
  // findOneAndUpdate(query, data, options)
  // req.body contiene todos los datos enviados en el formulario
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return new store instead the old one
    runValidators: true,
  }).exec(); // exec() ejecuta la query

  // 2. Redirect them the store and tell it worked
  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${
      store.slug
    }">View Store -></a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  // Query the db for the requested store
  // "populate" permite traer todos los datos relacionados con el campo especificado. El campo "author" contiene el ID del autor, entonces de esta forma estaran todos los campos disponibles que tenga el autor
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  // Si la query no encuentra nada, retorna "null"
  if (!store) return next();
  // "next" hara que se ejecute lo siguiente a "app.use('/', routes)" declara en "app.js"
  // En este caso se ejecutará "app.use(errorHandlers.notFound)"
  res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res, next) => {
  const { tag } = req.params;

  // Si no hay tag elegido, devolver todos los stores que tengan al menos un tag
  // "$exists: true" significa si existe al menos un valor en la propiedad tag
  const tagQuery = tag || { $exists: true };

  // Get a list of all the stores
  // Se pueden crear metodos propios para usar en los schema
  const tagsPromise = Store.getTagsList();
  // Encontrar los stores que contengan esos tags
  const storesPromise = Store.find({ tags: tagQuery });

  // Esperar a que las dos promesas retornen
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render('tag', { tags, title: 'Tags', tag, stores });
};

exports.searchStores = async (req, res) => {
  // MongoDB: $text performs a text search on the content of the fields indexed with a text index
  const stores = await Store
    // find stores that match
    .find(
      {
        $text: {
          $search: req.query.q,
        },
      },
      {
        score: { $meta: 'textScore' },
      }
    )
    // sort them by relevance
    .sort({
      score: { $meta: 'textScore' },
    })
    // limit to only 5 results
    .limit(5);

  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      // $near es un operador de MongoDB que permite buscar ubicaciones cercanas
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 10000, // 10 km
      },
    },
  };

  // Solo traer ciertos campos de la base de datos con 'select'
  const stores = await Store.find(q)
    .select('slug photo name description location')
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
  // We need to know the person hearted stores first
  const hearts = req.user.hearts.map(obj => obj.toString());
  // If they already have the store then we must remove it, like a toggle
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  // Find the current user and update it
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    // find the stores where its id are in the heart array
    _id: { $in: req.user.hearts },
  });
  res.render('stores', { title: 'Hearted Stores', stores });
};
