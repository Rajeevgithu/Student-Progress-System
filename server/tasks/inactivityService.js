const Student = require('../models/Student');
const emailService = require('../services/emailService');

class InactivityService {
  constructor() {
    this.INACTIVITY_THRESHOLD = 7; // days
    this.MAX_REMINDERS = 3; // maximum number of reminders to send
  }

  async checkInactivity() {
    try {
      const inactiveStudents = await Student.find({
        emailNotifications: true,
        lastSubmission: {
          $lt: new Date(Date.now() - this.INACTIVITY_THRESHOLD * 24 * 60 * 60 * 1000)
        },
        reminderCount: { $lt: this.MAX_REMINDERS },
        $or: [
          { lastReminderSent: { $exists: false } },
          { lastReminderSent: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      });

      for (const student of inactiveStudents) {
        await this.sendInactivityReminder(student);
      }

      return inactiveStudents.length;
    } catch (error) {
      console.error('Error checking inactivity:', error);
      throw error;
    }
  }

  async sendInactivityReminder(student) {
    try {
      await emailService.sendInactivityReminder(student);
    } catch (error) {
      console.error(`Error sending inactivity reminder to ${student.email}:`, error);
      // Don't throw the error to prevent blocking other reminders
    }
  }

  async sendWeeklyReports() {
    try {
      const students = await Student.find({
        emailNotifications: true,
        lastSubmission: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      });

      for (const student of students) {
        try {
          await emailService.sendWeeklyReport(student);
        } catch (error) {
          console.error(`Error sending weekly report to ${student.email}:`, error);
          // Don't throw the error to prevent blocking other reports
        }
      }

      return students.length;
    } catch (error) {
      console.error('Error sending weekly reports:', error);
      throw error;
    }
  }

  async updateLastSubmission(studentId, submissionTime) {
    try {
      await Student.findByIdAndUpdate(studentId, {
        lastSubmission: submissionTime,
        reminderCount: 0 // Reset reminder count when new activity is detected
      });
    } catch (error) {
      console.error(`Error updating last submission for student ${studentId}:`, error);
      throw error;
    }
  }
}

module.exports = new InactivityService(); 