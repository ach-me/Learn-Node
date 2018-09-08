// nodemailer interactua con SMTP
const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

// transport es una forma de interactuar con diferentes formar de enviar emails, siend SMTP la mas comun
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// // Testear el envio de mails
// transport.sendMail({
//   from: 'Menachca <ignaciomenchaca@gmail.com>',
//   to: 'blabla@example.com',
//   subject: 'Probando LearnNode',
//   html: 'Hey sending <strong>Test</strong>',
//   text: 'Lovin It',
// });

// Este metodo no se exporta porque no es necesario que este disponible fuera de este modulo
const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);

  const inlined = juice(html);
  return inlined;
};

// Cada vez que alguien resetea su password
exports.send = async options => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: `Menachk <no-replay@ach.com>`,
    to: options.user.email,
    subject: options.subject,
    html,
    text,
  };

  // el metodo sendMail no devuelve una promesa sino un callback
  // hay que promisificarlo
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
