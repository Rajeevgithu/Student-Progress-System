const cron = require('node-cron');
const nodemailer = require('nodemailer');
const axios = require('axios');
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

cron.schedule('0 2 * * *', async () => {
  const students = await Student.find();
  for (const student of students) {
    try {
      // Fetch Codeforces data
      const userInfo = await axios.get(`https://codeforces.com/api/user.info?handles=${student.cfHandle}`);
      const userRating = await axios.get(`https://codeforces.com/api/user.rating?handle=${student.cfHandle}`);
      const userStatus = await axios.get(`https://codeforces.com/api/user.status?handle=${student.cfHandle}`);

      // Update student and Codeforces data
      await Student.updateOne({ _id: student._id }, {
        currentRating: userInfo.data.result[0].rating,
        maxRating: userInfo.data.result[0].maxRating,
        lastUpdated: new Date(),
      });

      await CodeforcesData.updateOne({ studentId: student._id }, {
        contestHistory: userRating.data.result,
        submissions: userStatus.data.result,
      }, { upsert: true });

      // Check inactivity
      const lastSubmission = userStatus.data.result[0]?.creationTimeSeconds * 1000 || 0;
      if (!student.emailDisabled && (Date.now() - lastSubmission) > 7 * 24 * 60 * 60 * 1000) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: student.email,
          subject: 'Get Back to Problem Solving!',
          text: `Hi ${student.name}, you haven't solved problems on Codeforces in over a week. Keep practicing!`,
        });
        await Student.updateOne({ _id: student._id }, { $inc: { reminderCount: 1 } });
      }
    } catch (error) {
      console.error(`Error syncing ${student.cfHandle}:`, error);
    }
  }
});
