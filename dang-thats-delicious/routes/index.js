const express = require('express');
const router = express.Router();

// Formas de acceder a los datos de la URL

// Do work here
router.get('/', (req, res) => {
  const wes = { name: 'Wes', age: 30, cool: true };
  // res.send('Hey! It works!');
  // res.json(wes);

  // Tomar los datos que vienen en la url como parametros
  // "req" tiene toda la informacion solicitada
  // "res" tiene todos los metodos para devolver datos
  // "req.query" se encarga de los parametros

  // res.send(`Nombre: ${req.query.name} - Edad ${req.query.age}`);
  res.json(req.query);
});

// "req.params" accede a los campos variables de la url:
// las variables se indican como ":variable"
router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
});

module.exports = router;
