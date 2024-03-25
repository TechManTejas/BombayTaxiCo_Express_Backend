const nodemailer = require('nodemailer');

export const sendEmail = async (emailOptions: any) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Your SMTP server host
    port: 465, // SMTP port (typically 587 for secure, 25 for non-secure)
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'contact@bombaytaxicompany.com', // SMTP username
      pass: 'Changeoncedone@123', // SMTP password
    },
  });

  let info = await transporter.sendMail({
    from: '"Bombay Taxi Company" <contact@bombaytaxicompany.com>', // sender address
    to: "contact@bombaytaxicompany.com", // list of receivers
    subject: emailOptions.subject, // Subject line
    text: emailOptions.message, // plain text body
    html: `<p>${emailOptions.message}</p>`, // HTML body content
  });

  console.log("Message sent: %s", info.messageId);
};
