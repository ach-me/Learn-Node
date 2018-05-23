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

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};
