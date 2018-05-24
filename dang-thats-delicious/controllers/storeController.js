// exports es como variable global. todo lo que se ponga en ella, sera "importable" desde otro archivo
// "req" son los datos que entran
// "res" son los datos que salen
// "next" es necesario en los middleware
// exports.myMiddleware = (req, res, next) => {
//   req.name = 'Wes';
//   // res.cookie('name', 'Wes is cool', { maxAge: 90000 });
//   // if (req.name === 'Wes') {
//   //   throw Error('LASKDLAKSLDK');
//   // }
//   // Terminé con este middleware, seguir con lo que sigue
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
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  // Mostrar template
  res.render('editStore', {
    title: 'Add Store'
  });
};

exports.createStore = async (req, res) => {
  // "req.body" contiene toda la informacion enviada
  // en el formulario
  // res.json(req.body);

  // 'Store' recibe las propiedades con las que fue definido
  // en el scheme del archivo 'Store.js'
  const store = new Store(req.body);

  // Lanza una conexion a la base de datos mongodb y guarda los datos
  // Devuelve los datos guardados o un error
  // Como JS es asincronico por default, va a ejecutar el guardado
  // y seguira con el codigo siguiente. Si hay un error en el guardado
  // no importaría y el usuario no se enteraría que no se guardó.
  // Para evitarlo hay que forzarlo a esperar con promesas
  // Se pueden utilizar promesas porque se indico a mongoose en el
  // archivo 'start.js':
  // mongoose.Promise = global.Promise
  await store.save();
  res.redirect('/');
};
