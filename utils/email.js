const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //   1) Creating Transpoter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //   2) Creating  Mail Object and options
  let mailOptions = {
    from: "amritpoudel433@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //   3) sending the mail

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
