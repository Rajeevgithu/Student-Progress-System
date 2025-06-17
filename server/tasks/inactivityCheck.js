const cron = require('node-cron');
const inactivityService = require('../services/inactivityService');

let scheduledTasks = [];

const startScheduledTasks = () => {
  // Schedule daily inactivity check at 9 AM
  const dailyTask = cron.schedule('0 9 * * *', async () => {
    try {
      await inactivityService.checkInactivity();
    } catch (error) {
      console.error('Error in daily inactivity check:', error);
    }
  });

  // Schedule weekly report generation at 10 AM every Monday
  const weeklyTask = cron.schedule('0 10 * * 1', async () => {
    try {
      const weeklyStats = await inactivityService.calculateWeeklyStats();
      await inactivityService.generateWeeklyReport(weeklyStats);
    } catch (error) {
      console.error('Error in weekly report generation:', error);
    }
  });

  scheduledTasks.push(dailyTask, weeklyTask);
  console.log('Scheduled tasks started successfully');
};

const stopScheduledTasks = () => {
  scheduledTasks.forEach(task => task.stop());
  scheduledTasks = [];
  console.log('Scheduled tasks stopped successfully');
};

module.exports = {
  startScheduledTasks,
  stopScheduledTasks
}; 