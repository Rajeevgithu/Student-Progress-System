const Student = require('../../models/Student');
const emailService = require('../../services/emailService');
const inactivityService = require('../../services/inactivityService');

jest.mock('../../models/Student');
jest.mock('../../services/emailService');

describe('InactivityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkInactivity', () => {
    const mockStudents = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        cfHandle: 'john_doe',
        lastSubmission: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        emailNotifications: true,
        reminderCount: 0
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        cfHandle: 'jane_smith',
        lastSubmission: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        emailNotifications: true,
        reminderCount: 0
      }
    ];

    it('identifies and notifies inactive students', async () => {
      Student.find.mockResolvedValue(mockStudents);
      emailService.sendReminderEmail.mockResolvedValue({ messageId: '123' });

      await inactivityService.checkInactivity();

      expect(Student.find).toHaveBeenCalled();
      expect(emailService.sendReminderEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendReminderEmail).toHaveBeenCalledWith(mockStudents[0]);
      expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        {
          $inc: { reminderCount: 1 },
          $set: { lastReminderSent: expect.any(Date) }
        }
      );
    });

    it('respects maximum reminder limit', async () => {
      const studentWithMaxReminders = {
        ...mockStudents[0],
        reminderCount: 3
      };
      Student.find.mockResolvedValue([studentWithMaxReminders]);

      await inactivityService.checkInactivity();

      expect(emailService.sendReminderEmail).not.toHaveBeenCalled();
    });

    it('handles database errors', async () => {
      Student.find.mockRejectedValue(new Error('Database error'));

      await expect(inactivityService.checkInactivity())
        .rejects
        .toThrow('Database error');
    });

    it('handles email sending errors', async () => {
      Student.find.mockResolvedValue([mockStudents[0]]);
      emailService.sendReminderEmail.mockRejectedValue(new Error('Email error'));

      await expect(inactivityService.checkInactivity())
        .rejects
        .toThrow('Email error');
    });
  });

  describe('resetReminderCount', () => {
    it('resets reminder count on new activity', async () => {
      const student = {
        _id: '1',
        reminderCount: 2
      };

      await inactivityService.resetReminderCount(student._id);

      expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
        student._id,
        { $set: { reminderCount: 0 } }
      );
    });

    it('handles database errors', async () => {
      Student.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      await expect(inactivityService.resetReminderCount('1'))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('generateWeeklyReport', () => {
    const mockStudents = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        cfHandle: 'john_doe',
        currentRating: 1500,
        maxRating: 1600,
        solvedProblems: 50,
        emailNotifications: true
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        cfHandle: 'jane_smith',
        currentRating: 1700,
        maxRating: 1800,
        solvedProblems: 75,
        emailNotifications: true
      }
    ];

    const mockWeeklyStats = {
      '1': {
        ratingChange: 50,
        problemsSolved: 10,
        contestsParticipated: 2
      },
      '2': {
        ratingChange: 100,
        problemsSolved: 15,
        contestsParticipated: 3
      }
    };

    it('generates and sends weekly reports', async () => {
      Student.find.mockResolvedValue(mockStudents);
      emailService.sendWeeklyReport.mockResolvedValue({ messageId: '123' });

      await inactivityService.generateWeeklyReport(mockWeeklyStats);

      expect(emailService.sendWeeklyReport).toHaveBeenCalledTimes(2);
      expect(emailService.sendWeeklyReport).toHaveBeenCalledWith(
        mockStudents[0],
        mockWeeklyStats['1']
      );
      expect(emailService.sendWeeklyReport).toHaveBeenCalledWith(
        mockStudents[1],
        mockWeeklyStats['2']
      );
    });

    it('respects email notification preferences', async () => {
      const studentsWithDisabledNotifications = [
        {
          ...mockStudents[0],
          emailNotifications: false
        },
        mockStudents[1]
      ];
      Student.find.mockResolvedValue(studentsWithDisabledNotifications);

      await inactivityService.generateWeeklyReport(mockWeeklyStats);

      expect(emailService.sendWeeklyReport).toHaveBeenCalledTimes(1);
      expect(emailService.sendWeeklyReport).toHaveBeenCalledWith(
        mockStudents[1],
        mockWeeklyStats['2']
      );
    });

    it('handles database errors', async () => {
      Student.find.mockRejectedValue(new Error('Database error'));

      await expect(inactivityService.generateWeeklyReport(mockWeeklyStats))
        .rejects
        .toThrow('Database error');
    });

    it('handles email sending errors', async () => {
      Student.find.mockResolvedValue([mockStudents[0]]);
      emailService.sendWeeklyReport.mockRejectedValue(new Error('Email error'));

      await expect(inactivityService.generateWeeklyReport(mockWeeklyStats))
        .rejects
        .toThrow('Email error');
    });
  });
}); 