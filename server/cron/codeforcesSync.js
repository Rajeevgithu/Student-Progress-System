const cron = require('node-cron');
const { syncCodeforcesData } = require('../services/codeforcesService');
const { checkInactivity } = require('../services/inactivityService');
const config = require('../config');

// Schedule Codeforces data sync
cron.schedule(config.cron.schedule, async () => {
  console.log('Running Codeforces data sync...');
  try {
    await syncCodeforcesData();
    console.log('Codeforces data sync completed successfully');
  } catch (error) {
    console.error('Error in Codeforces data sync:', error);
  }
});

// Schedule inactivity check (runs daily at 3 AM)
cron.schedule('0 3 * * *', async () => {
  console.log('Running inactivity check...');
  try {
    const inactiveCount = await checkInactivity();
    console.log(`Inactivity check completed. Found ${inactiveCount} inactive students.`);
  } catch (error) {
    console.error('Error in inactivity check:', error);
  }
}); 