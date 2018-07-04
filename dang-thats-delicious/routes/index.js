const express = require('express');

const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers'); // Object destructuring. Importa solo el metodo de igual nombre

// Formas de acceder a los datos de la URL

// Do work here

// Se traslado la logica al controlador "storeController"
// router.get('/', (req, res) => {
//   const wes = { name: 'Wes', age: 30, cool: true };
// res.send('Hey! It works!');
// res.json(wes);

// Tomar los datos que vienen en la url como parametros
// "req" tiene toda la informacion solicitada
// "res" tiene todos los metodos para devolver datos
// "req.query" se encarga de los parametros

// res.send(`Nombre: ${req.query.name} - Edad ${req.query.age}`);
// res.json(req.query);

// Para mostrar un template:
// render('nombre del template', 'variable local')
// 'variable local' permite pasar informacion al template
//   res.render('hello', {
//     name: wes,
//     dog: 'snikers',
//     forma dinamica
//     dog: req.query.name,
//     title: 'I love food'
//   });
// });

// "req.params" accede a los campos variables de la url:
// las variables se indican como ":variable"
// router.get('/reverse/:name', (req, res) => {
//   const reverse = [...req.params.name].reverse().join('');
//   res.send(reverse);
// });

// Primero toma el control el middleware, con la sentencia "next()"
// le pasa el control al siguiente parametro
// primero realiza el middleware, luego muestra el homepage
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/add', storeController.addStore);

// Cuando se envia por POST en la siguiente direccion
// Agregar el store
router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post(
  '/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

module.exports = router;
