const nodemailer = require('nodemailer');

export const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Your SMTP server host
  port: 465, // SMTP port (typically 587 for secure, 25 for non-secure)
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'contact@bombaytaxico.com', // SMTP username
    pass: 'Changeoncedone@123', // SMTP password
  },
});

export const sendEmail = async (emailOptions: any) => {
  if (!emailOptions || !emailOptions.to) {
    throw new Error('Email recipient (to) is required');
  }
  if (!emailOptions.subject) {
    throw new Error('Email subject is required');
  }
  if (!emailOptions.message) {
    throw new Error('Email message is required');
  }

  let info = await transporter.sendMail({
    from: '"Bombay Taxi Company" <contact@bombaytaxico.com>', // sender address
    to: emailOptions.to, // list of receivers
    subject: emailOptions.subject, // Subject line
    text: emailOptions.message, // plain text body
    html: `${emailOptions.message}`, // HTML body content
  });

  console.log("Message sent: %s", info.messageId);
};

export const sendEmailWithAttachments = async (emailOptions: any) => {
  if (!emailOptions || !emailOptions.to) {
    throw new Error('Email recipient (to) is required');
  }
  if (!emailOptions.subject) {
    throw new Error('Email subject is required');
  }
  if (!emailOptions.message) {
    throw new Error('Email message is required');
  }
  if (!emailOptions.attachment) {
    throw new Error('Attachment path is required');
  }

  let info = await transporter.sendMail({
    from: '"Bombay Taxi Company" <contact@bombaytaxico.com>',
    to: emailOptions.to,
    subject: emailOptions.subject,
    text: emailOptions.message,
    html: `${emailOptions.message}`,
    attachments: [
      {  
        filename: 'invoice.pdf',
        path: emailOptions.attachment
      },
    ]
  });

  console.log("Message sent with attachment: %s", info.messageId);
};