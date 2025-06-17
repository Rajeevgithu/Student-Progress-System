const codeforcesService = require('../services/codeforcesService');
const Student = require('../models/Student');

const codeforcesController = {
  // Update a student's Codeforces data
  async updateStudentData(req, res) {
    try {
      const { studentId } = req.params;
      const updatedStudent = await codeforcesService.updateStudentData(studentId);
      res.json(updatedStudent);
    } catch (error) {
      console.error('Error updating student data:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a student's contest history
  async getContestHistory(req, res) {
    try {
      const { studentId } = req.params;
      const { days = 30 } = req.query;

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const contestHistory = student.getRatingChanges(parseInt(days));
      res.json(contestHistory);
    } catch (error) {
      console.error('Error fetching contest history:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a student's problem solving statistics
  async getProblemStats(req, res) {
    try {
      const { studentId } = req.params;
      const { days = 30 } = req.query;

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Update and get the latest stats
      const stats = student.updateProblemSolvingStats();
      await student.save();

      res.json({
        stats,
        problems: student.getProblemsSolved(parseInt(days))
      });
    } catch (error) {
      console.error('Error fetching problem stats:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Verify a Codeforces handle
  async verifyHandle(req, res) {
    try {
      const { handle } = req.params;
      const userInfo = await codeforcesService.fetchUserInfo(handle);
      res.json(userInfo);
    } catch (error) {
      console.error('Error verifying handle:', error);
      res.status(404).json({ error: 'Invalid Codeforces handle' });
    }
  }
};

module.exports = codeforcesController; 