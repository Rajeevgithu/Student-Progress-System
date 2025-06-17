const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Student, CodeforcesData } = require('../models/Student');

router.get('/:id/cf-data', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  try {
    const [userInfo, ratingInfo, submissionsInfo] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${student.cfHandle}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${student.cfHandle}`),
      axios.get(`https://codeforces.com/api/user.status?handle=${student.cfHandle}`)
    ]);

    const cfDetails = userInfo.data.result[0];

    student.currentRating = cfDetails.rating || null;
    student.maxRating = cfDetails.maxRating || null;
    student.lastUpdated = new Date();
    await student.save();

    const cfData = await CodeforcesData.findOneAndUpdate(
      { studentId: student._id },
      {
        studentId: student._id,
        contestHistory: ratingInfo.data.result.map(c => ({
          contestId: c.contestId,
          name: c.contestName,
          ratingChange: c.newRating - c.oldRating,
          rank: c.rank,
          date: new Date(c.ratingUpdateTimeSeconds * 1000)
        })),
        submissions: submissionsInfo.data.result.map(s => ({
          problemId: `${s.problem.contestId}-${s.problem.index}`,
          rating: s.problem.rating || null,
          solved: s.verdict === 'OK',
          date: new Date(s.creationTimeSeconds * 1000)
        }))
      },
      { upsert: true, new: true }
    );

    res.json({ student, cfData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Codeforces data' });
  }
});

module.exports = router;
