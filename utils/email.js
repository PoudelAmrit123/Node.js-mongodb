const nodemailer = require("nodemailer");
const {MailSlurp, CreateInboxDtoInboxTypeEnum} = require('mailslurp-client');



// const sendEmail = async (options) => {
//   //   1) Creating Transpoter
//   const transporter = nodemailer.createTransport({
//     host: 'process.env.EMAIL_HOST',
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   //   2) Creating  Mail Object and options
//   let mailOptions = {
//     from: "amritpoudel433@gmail.com",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   //   3) sending the mail

//   await transporter.sendMail(mailOptions);
// };



  //****************************//

// const sendEmail = async(options)=>{
//   try {
//     const mailslurp = new MailSlurp(process.env.EMAIL_PORT);
//     const inbox = await mailslurp.createInbox();
//     const emailAddress = inbox.emailAddress;

//     const transporter = nodemailer.createTransport({
//       host: 'mailslurp.mx',
//       port: 2587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });


//      let mailOptions = {
//     from: "amritpoudel433@gmail.com",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//     const info = await transporter.sendMail(mailOptions);
//     console.log(`Email sent: ${info.messageId}`);
//   } catch (error) {
//     console.error(error);
//   }
// }



 //****************************//

 const sendEmail = async (options) => {
  try {
    const mailslurp = new MailSlurp(process.env.MAILSLURP_API_KEY);
    const inbox = await mailslurp.createInbox();
    const emailAddress = inbox.emailAddress;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
       port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: emailAddress,
        pass: inbox.password,
        // user: process.env.EMAIL_USERNAME,
        // pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: emailAddress,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error(error);
  }
};


module.exports = sendEmail;
