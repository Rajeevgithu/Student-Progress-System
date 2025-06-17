const nodemailer = require('nodemailer');
const emailService = require('../../services/emailService');

jest.mock('nodemailer');

describe('EmailService', () => {
  let mockTransporter;
  let mockSendMail;

  beforeEach(() => {
    mockSendMail = jest.fn();
    mockTransporter = {
      sendMail: mockSendMail
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendReminderEmail', () => {
    const student = {
      name: 'John Doe',
      email: 'john@example.com',
      cfHandle: 'john_doe',
      lastSubmission: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
    };

    it('sends reminder email successfully', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '123' });

      await emailService.sendReminderEmail(student);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: student.email,
        subject: expect.stringContaining('Inactivity Reminder'),
        html: expect.stringContaining(student.name)
      });
    });

    it('handles email sending errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Failed to send email'));

      await expect(emailService.sendReminderEmail(student))
        .rejects
        .toThrow('Failed to send email');
    });

    it('respects email notification preferences', async () => {
      const studentWithDisabledNotifications = {
        ...student,
        emailNotifications: false
      };

      await emailService.sendReminderEmail(studentWithDisabledNotifications);

      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendWeeklyReport', () => {
    const student = {
      name: 'John Doe',
      email: 'john@example.com',
      cfHandle: 'john_doe',
      currentRating: 1500,
      maxRating: 1600,
      solvedProblems: 50
    };

    const weeklyStats = {
      ratingChange: 50,
      problemsSolved: 10,
      contestsParticipated: 2
    };

    it('sends weekly report successfully', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '123' });

      await emailService.sendWeeklyReport(student, weeklyStats);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: student.email,
        subject: expect.stringContaining('Weekly Progress Report'),
        html: expect.stringContaining(student.name)
      });
    });

    it('handles email sending errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Failed to send email'));

      await expect(emailService.sendWeeklyReport(student, weeklyStats))
        .rejects
        .toThrow('Failed to send email');
    });

    it('respects email notification preferences', async () => {
      const studentWithDisabledNotifications = {
        ...student,
        emailNotifications: false
      };

      await emailService.sendWeeklyReport(studentWithDisabledNotifications, weeklyStats);

      expect(mockSendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendContestReminder', () => {
    const contest = {
      name: 'Codeforces Round #123',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      duration: 120
    };

    const students = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        cfHandle: 'john_doe'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        cfHandle: 'jane_smith'
      }
    ];

    it('sends contest reminders successfully', async () => {
      mockSendMail.mockResolvedValue({ messageId: '123' });

      await emailService.sendContestReminder(contest, students);

      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: students[0].email,
        subject: expect.stringContaining('Contest Reminder'),
        html: expect.stringContaining(contest.name)
      });
    });

    it('handles email sending errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Failed to send email'));

      await expect(emailService.sendContestReminder(contest, students))
        .rejects
        .toThrow('Failed to send email');
    });

    it('respects email notification preferences', async () => {
      const studentsWithDisabledNotifications = [
        {
          ...students[0],
          emailNotifications: false
        },
        students[1]
      ];

      await emailService.sendContestReminder(contest, studentsWithDisabledNotifications);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: students[1].email,
        subject: expect.stringContaining('Contest Reminder'),
        html: expect.stringContaining(contest.name)
      });
    });
  });
}); 