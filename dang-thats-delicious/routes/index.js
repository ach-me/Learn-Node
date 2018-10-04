const express = require('express');

const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
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

// Antes de mostrar el formulario de agregar store, verificar si esta logueado a traves del middleware predefinido
router.get('/add', authController.isLoggedIn, storeController.addStore);

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

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);
router.post(
  '/register',
  // 1. Validate registration data
  userController.validateRegister,

  // 2. Register/save the user
  userController.register,

  // 3. Log them in
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post(
  '/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);
router.get('/map', storeController.mapPage);
router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts));
router.post('/reviews/:id', authController.isLoggedIn, catchErrors(reviewController.addReview));

/**
 * API ENDPOINTS
 */

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

module.exports = router;
