const axios = require('axios');
const Student = require('../models/Student');
const { sleep } = require('../utils/helpers');

class CodeforcesService {
  constructor() {
    this.baseUrl = 'https://codeforces.com/api';
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds in milliseconds
  }

  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await sleep(this.minRequestInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  async fetchUserInfo(handle) {
    try {
      await this.waitForRateLimit();
      const response = await axios.get(`${this.baseUrl}/user.info`, {
        params: {
          handles: handle
        }
      });

      if (response.data.status === 'OK' && response.data.result.length > 0) {
        const user = response.data.result[0];
        return {
          handle: user.handle,
          rating: user.rating || 0,
          maxRating: user.maxRating || 0,
          rank: user.rank || 'unrated',
          maxRank: user.maxRank || 'unrated',
          lastUpdated: new Date()
        };
      }
      throw new Error('User not found');
    } catch (error) {
      console.error(`Error fetching user info for ${handle}:`, error.message);
      throw error;
    }
  }

  async fetchUserRating(handle) {
    try {
      await this.waitForRateLimit();
      const response = await axios.get(`${this.baseUrl}/user.rating`, {
        params: {
          handle: handle
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result.map(contest => ({
          contestId: contest.contestId,
          contestName: contest.contestName,
          rank: contest.rank,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
          date: new Date(contest.ratingUpdateTimeSeconds * 1000)
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching rating history for ${handle}:`, error.message);
      throw error;
    }
  }

  async fetchUserStatus(handle) {
    try {
      await this.waitForRateLimit();
      const response = await axios.get(`${this.baseUrl}/user.status`, {
        params: {
          handle: handle,
          count: 1000 // Fetch last 1000 submissions
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result.map(submission => ({
          id: submission.id,
          contestId: submission.problem.contestId,
          problemIndex: submission.problem.index,
          problemName: submission.problem.name,
          rating: submission.problem.rating || 0,
          verdict: submission.verdict,
          programmingLanguage: submission.programmingLanguage,
          submissionTime: new Date(submission.creationTimeSeconds * 1000)
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching submission history for ${handle}:`, error.message);
      throw error;
    }
  }

  async updateStudentData(studentId) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Fetch all data in parallel
      const [userInfo, ratingHistory, submissions] = await Promise.all([
        this.fetchUserInfo(student.cfHandle),
        this.fetchUserRating(student.cfHandle),
        this.fetchUserStatus(student.cfHandle)
      ]);

      // Update student document
      student.currentRating = userInfo.rating;
      student.maxRating = userInfo.maxRating;
      student.rank = userInfo.rank;
      student.maxRank = userInfo.maxRank;
      student.lastUpdated = new Date();

      // Update contest history
      student.contestHistory = ratingHistory;

      // Process and store submissions
      const solvedProblems = new Set();
      const problemStats = new Map();

      submissions.forEach(submission => {
        const problemKey = `${submission.contestId}${submission.problemIndex}`;
        
        if (submission.verdict === 'OK') {
          solvedProblems.add(problemKey);
          
          if (!problemStats.has(problemKey)) {
            problemStats.set(problemKey, {
              problemName: submission.problemName,
              rating: submission.rating,
              firstSolved: submission.submissionTime
            });
          }
        }
      });

      student.solvedProblems = Array.from(solvedProblems).map(key => {
        const stats = problemStats.get(key);
        return {
          problemId: key,
          problemName: stats.problemName,
          rating: stats.rating,
          firstSolved: stats.firstSolved
        };
      });

      await student.save();
      return student;
    } catch (error) {
      console.error(`Error updating student data for ID ${studentId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new CodeforcesService(); 