const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use app password if 2FA is on
  }
});

const sendReminderEmail = async (to, name) => {
  await transporter.sendMail({
    from: '"CF Reminder" <your-email@gmail.com>',
    to,
    subject: 'Codeforces Activity Reminder',
    text: `Hi ${name},\n\nWe noticed you haven't submitted on Codeforces in a while. Time to practice! 💪`
  });
};

module.exports = sendReminderEmail;
