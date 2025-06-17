const Student = require('../models/Student');
const nodemailer = require('nodemailer');
const config = require('../config');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

const checkInactivity = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveStudents = await Student.find({
      lastSubmissionDate: { $lt: sevenDaysAgo },
      emailRemindersEnabled: true
    });

    for (const student of inactiveStudents) {
      // Check if we haven't sent a reminder in the last 7 days
      const lastReminder = student.lastReminderSent || new Date(0);
      const daysSinceLastReminder = Math.floor((new Date() - lastReminder) / (1000 * 60 * 60 * 24));

      if (daysSinceLastReminder >= 7) {
        await sendReminderEmail(student);
        
        // Update student record
        student.reminderEmailsSent += 1;
        student.lastReminderSent = new Date();
        await student.save();
      }
    }

    return inactiveStudents.length;
  } catch (error) {
    console.error('Error checking inactivity:', error);
    throw error;
  }
};

const sendReminderEmail = async (student) => {
  const mailOptions = {
    from: config.email.user,
    to: student.email,
    subject: 'Codeforces Activity Reminder',
    html: `
      <h2>Hello ${student.name},</h2>
      <p>We noticed that you haven't made any submissions on Codeforces in the last 7 days.</p>
      <p>Keep up your practice to maintain and improve your skills!</p>
      <p>Your current Codeforces handle: ${student.cfHandle}</p>
      <p>Current rating: ${student.currentRating}</p>
      <p>Best of luck with your programming journey!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${student.email}`);
  } catch (error) {
    console.error(`Error sending reminder email to ${student.email}:`, error);
    throw error;
  }
};

const toggleEmailReminders = async (studentId, enabled) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    student.emailRemindersEnabled = enabled;
    await student.save();
    return student;
  } catch (error) {
    console.error('Error toggling email reminders:', error);
    throw error;
  }
};

const resetReminderCount = async (studentId) => {
  try {
    await Student.findByIdAndUpdate(studentId, { $set: { reminderCount: 0 } });
  } catch (error) {
    console.error('Error resetting reminder count:', error);
    throw error;
  }
};

const calculateWeeklyStats = async () => {
  try {
    const students = await Student.find({ emailNotifications: true });
    const weeklyStats = {};

    for (const student of students) {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Calculate rating change
      const ratingChange = student.currentRating - (student.lastWeekRating || student.currentRating);
      
      // Calculate problems solved in the last week
      const problemsSolved = student.solvedProblems - (student.lastWeekSolvedProblems || student.solvedProblems);
      
      // Calculate contests participated
      const contestsParticipated = student.contestsParticipated - (student.lastWeekContests || 0);

      weeklyStats[student._id] = {
        ratingChange,
        problemsSolved,
        contestsParticipated
      };

      // Update last week's stats
      await Student.findByIdAndUpdate(student._id, {
        $set: {
          lastWeekRating: student.currentRating,
          lastWeekSolvedProblems: student.solvedProblems,
          lastWeekContests: student.contestsParticipated
        }
      });
    }

    return weeklyStats;
  } catch (error) {
    console.error('Error calculating weekly stats:', error);
    throw error;
  }
};

const generateWeeklyReport = async (weeklyStats) => {
  try {
    const students = await Student.find({ emailNotifications: true });

    for (const student of students) {
      if (weeklyStats[student._id]) {
        try {
          await emailService.sendWeeklyReport(student, weeklyStats[student._id]);
        } catch (error) {
          console.error(`Error sending weekly report to ${student.email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error generating weekly reports:', error);
    throw error;
  }
};

module.exports = {
  checkInactivity,
  toggleEmailReminders,
  resetReminderCount,
  calculateWeeklyStats,
  generateWeeklyReport
}; 