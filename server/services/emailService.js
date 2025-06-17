const nodemailer = require('nodemailer');
const Student = require('../models/Student');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendReminderEmail = async (student) => {
  if (!student.emailNotifications) {
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: student.email,
    subject: 'Inactivity Reminder - Codeforces Progress',
    html: `
      <h2>Hello ${student.name},</h2>
      <p>We noticed that you haven't made any submissions on Codeforces in the last 7 days.</p>
      <p>Your Codeforces handle: ${student.cfHandle}</p>
      <p>Last submission: ${new Date(student.lastSubmission).toLocaleDateString()}</p>
      <p>Keep up the good work and continue practicing to improve your skills!</p>
      <p>Best regards,<br>Student Progress System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

const sendWeeklyReport = async (student, weeklyStats) => {
  if (!student.emailNotifications) {
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: student.email,
    subject: 'Weekly Progress Report - Codeforces',
    html: `
      <h2>Weekly Progress Report for ${student.name}</h2>
      <p>Here's your progress for the past week:</p>
      <ul>
        <li>Rating Change: ${weeklyStats.ratingChange > 0 ? '+' : ''}${weeklyStats.ratingChange}</li>
        <li>Problems Solved: ${weeklyStats.problemsSolved}</li>
        <li>Contests Participated: ${weeklyStats.contestsParticipated}</li>
      </ul>
      <p>Current Rating: ${student.currentRating}</p>
      <p>Total Problems Solved: ${student.solvedProblems}</p>
      <p>Keep up the great work!</p>
      <p>Best regards,<br>Student Progress System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending weekly report:', error);
    throw error;
  }
};

const sendContestReminder = async (contest, students) => {
  const activeStudents = students.filter(student => student.emailNotifications);

  for (const student of activeStudents) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: student.email,
      subject: 'Upcoming Codeforces Contest Reminder',
      html: `
        <h2>Hello ${student.name},</h2>
        <p>This is a reminder about the upcoming Codeforces contest:</p>
        <h3>${contest.name}</h3>
        <p>Start Time: ${new Date(contest.startTime).toLocaleString()}</p>
        <p>Duration: ${contest.duration} minutes</p>
        <p>Don't forget to participate and give your best!</p>
        <p>Best regards,<br>Student Progress System</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error sending contest reminder to ${student.email}:`, error);
    }
  }
};

module.exports = {
  sendReminderEmail,
  sendWeeklyReport,
  sendContestReminder
}; 