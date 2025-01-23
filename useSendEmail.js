const nodemailer = require('nodemailer')
const useSendEmail = async (userEmail, subject, content) => {
  let config = {
    service: 'gmail',
    auth: {
      user: process.env.EmailSender,
      pass: process.env.EmailPass,
    },
  };
  let transporter = nodemailer.createTransport(config);
  let message = {
    from: process.env.EmailSender, // sender address
    to: userEmail, // list of receivers
    subject: subject, // Subject line
    text: content, // plain text body
  };
  await transporter
    .sendMail(message)
    .then(() => {
      return { msg: 'Email successfully sent' };
    })
    .catch((err) => {
      console.log(err);
      return { msg: `Something went wrong..${err}` };
    });
};

module.exports = useSendEmail