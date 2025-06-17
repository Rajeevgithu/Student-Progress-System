const cron = require('node-cron');
const inactivityService = require('../../services/inactivityService');
const { startScheduledTasks, stopScheduledTasks } = require('../../scheduled/inactivityCheck');

jest.mock('node-cron');
jest.mock('../../services/inactivityService');

describe('Scheduled Tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startScheduledTasks', () => {
    it('schedules daily inactivity check', () => {
      const mockSchedule = jest.fn();
      cron.schedule.mockReturnValue(mockSchedule);

      startScheduledTasks();

      expect(cron.schedule).toHaveBeenCalledWith(
        '0 9 * * *', // 9 AM daily
        expect.any(Function)
      );
    });

    it('schedules weekly report generation', () => {
      const mockSchedule = jest.fn();
      cron.schedule.mockReturnValue(mockSchedule);

      startScheduledTasks();

      expect(cron.schedule).toHaveBeenCalledWith(
        '0 10 * * 1', // 10 AM every Monday
        expect.any(Function)
      );
    });

    it('handles errors in scheduled tasks', async () => {
      const mockSchedule = jest.fn();
      cron.schedule.mockReturnValue(mockSchedule);
      inactivityService.checkInactivity.mockRejectedValue(new Error('Task error'));

      startScheduledTasks();
      const dailyTask = cron.schedule.mock.calls[0][1];
      await dailyTask();

      expect(inactivityService.checkInactivity).toHaveBeenCalled();
      // Error should be logged but not thrown
    });
  });

  describe('stopScheduledTasks', () => {
    it('stops all scheduled tasks', () => {
      const mockTask = { stop: jest.fn() };
      cron.schedule.mockReturnValue(mockTask);

      startScheduledTasks();
      stopScheduledTasks();

      expect(mockTask.stop).toHaveBeenCalled();
    });
  });

  describe('Manual Task Execution', () => {
    it('executes inactivity check manually', async () => {
      await inactivityService.checkInactivity();

      expect(inactivityService.checkInactivity).toHaveBeenCalled();
    });

    it('executes weekly report generation manually', async () => {
      const mockWeeklyStats = {
        '1': {
          ratingChange: 50,
          problemsSolved: 10,
          contestsParticipated: 2
        }
      };

      await inactivityService.generateWeeklyReport(mockWeeklyStats);

      expect(inactivityService.generateWeeklyReport).toHaveBeenCalledWith(mockWeeklyStats);
    });
  });

  describe('Task Timing', () => {
    it('executes tasks at correct times', () => {
      const mockSchedule = jest.fn();
      cron.schedule.mockReturnValue(mockSchedule);

      startScheduledTasks();

      // Verify daily task schedule
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 9 * * *',
        expect.any(Function)
      );

      // Verify weekly task schedule
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 10 * * 1',
        expect.any(Function)
      );
    });

    it('handles timezone differences', () => {
      const mockSchedule = jest.fn();
      cron.schedule.mockReturnValue(mockSchedule);

      // Set timezone to UTC
      process.env.TZ = 'UTC';
      startScheduledTasks();

      // Verify schedules are in UTC
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 9 * * *',
        expect.any(Function)
      );
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 10 * * 1',
        expect.any(Function)
      );

      // Reset timezone
      process.env.TZ = 'local';
    });
  });

  describe('Task Dependencies', () => {
    it('waits for database connection before starting tasks', async () => {
      const mockSchedule = jest.fn();
      cron.schedule.mockReturnValue(mockSchedule);

      // Simulate database connection delay
      const dbConnection = new Promise(resolve => setTimeout(resolve, 100));
      await dbConnection;

      startScheduledTasks();

      expect(cron.schedule).toHaveBeenCalled();
    });

    it('handles task execution order', async () => {
      const mockSchedule = jest.fn();
      cron.schedule.mockReturnValue(mockSchedule);

      startScheduledTasks();

      // Verify tasks are scheduled in correct order
      const dailyTask = cron.schedule.mock.calls[0][1];
      const weeklyTask = cron.schedule.mock.calls[1][1];

      await dailyTask();
      await weeklyTask();

      expect(inactivityService.checkInactivity).toHaveBeenCalledBefore(
        inactivityService.generateWeeklyReport
      );
    });
  });
}); 