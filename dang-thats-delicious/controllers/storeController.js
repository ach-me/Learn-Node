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

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  // Mostrar template
  res.render('editStore', {
    title: 'Add Store',
  });
};

exports.createStore = async (req, res) => {
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
