const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  cfHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: 'unrated'
  },
  maxRank: {
    type: String,
    default: 'unrated'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastSubmission: {
    type: Date,
    default: Date.now
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  lastReminderSent: {
    type: Date
  },
  contestHistory: [{
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    date: Date
  }],
  solvedProblems: [{
    problemId: String,
    problemName: String,
    rating: Number,
    firstSolved: Date
  }],
  reminderEmailsSent: {
    type: Number,
    default: 0
  },
  emailRemindersEnabled: {
    type: Boolean,
    default: true
  },
  problemSolvingStats: {
    totalSolved: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    problemsByRating: [{
      rating: Number,
      count: Number
    }],
    submissionHeatmap: [{
      date: Date,
      count: Number
    }]
  }
}, {
  timestamps: true
});

// Index for efficient querying
studentSchema.index({ cfHandle: 1 });
studentSchema.index({ currentRating: -1 });
studentSchema.index({ lastUpdated: -1 });
studentSchema.index({ lastSubmission: -1 });
studentSchema.index({ emailNotifications: 1, lastSubmission: 1 });

// Virtual for calculating problem solving statistics
studentSchema.virtual('problemStats').get(function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

  const recentProblems = this.solvedProblems.filter(p => p.firstSolved >= thirtyDaysAgo);
  const problems90Days = this.solvedProblems.filter(p => p.firstSolved >= ninetyDaysAgo);

  return {
    totalSolved: this.solvedProblems.length,
    solvedLast30Days: recentProblems.length,
    solvedLast90Days: problems90Days.length,
    averageRating: this.solvedProblems.reduce((sum, p) => sum + p.rating, 0) / this.solvedProblems.length || 0,
    averagePerDay: recentProblems.length / 30 || 0
  };
});

// Method to get rating changes over time
studentSchema.methods.getRatingChanges = function(days) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.contestHistory
    .filter(contest => contest.date >= cutoffDate)
    .sort((a, b) => a.date - b.date);
};

// Method to get problems solved in a time period
studentSchema.methods.getProblemsSolved = function(days) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.solvedProblems
    .filter(problem => problem.firstSolved >= cutoffDate)
    .sort((a, b) => b.firstSolved - a.firstSolved);
};

// Method to check if student is inactive
studentSchema.methods.isInactive = function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.lastSubmission < cutoffDate;
};

// Method to calculate and update problem solving stats
studentSchema.methods.updateProblemSolvingStats = function() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

  const recentProblems = this.solvedProblems.filter(p => p.firstSolved >= thirtyDaysAgo);
  const problems90Days = this.solvedProblems.filter(p => p.firstSolved >= ninetyDaysAgo);

  // Calculate rating distribution
  const ratingBuckets = {
    '800-1000': 0,
    '1100-1300': 0,
    '1400-1600': 0,
    '1700-1900': 0,
    '2000+': 0
  };

  this.solvedProblems.forEach(problem => {
    const rating = problem.rating || 0;
    if (rating >= 800 && rating <= 1000) ratingBuckets['800-1000']++;
    else if (rating >= 1100 && rating <= 1300) ratingBuckets['1100-1300']++;
    else if (rating >= 1400 && rating <= 1600) ratingBuckets['1400-1600']++;
    else if (rating >= 1700 && rating <= 1900) ratingBuckets['1700-1900']++;
    else if (rating >= 2000) ratingBuckets['2000+']++;
  });

  // Calculate submission heatmap
  const submissionHeatmap = {};
  this.solvedProblems.forEach(problem => {
    const date = problem.firstSolved.toISOString().split('T')[0];
    submissionHeatmap[date] = (submissionHeatmap[date] || 0) + 1;
  });

  this.problemSolvingStats = {
    totalSolved: this.solvedProblems.length,
    solvedLast30Days: recentProblems.length,
    solvedLast90Days: problems90Days.length,
    averageRating: this.solvedProblems.reduce((sum, p) => sum + (p.rating || 0), 0) / this.solvedProblems.length || 0,
    averagePerDay: recentProblems.length / 30 || 0,
    ratingBuckets,
    submissionHeatmap: Object.entries(submissionHeatmap).map(([date, count]) => ({
      date: new Date(date),
      count
    }))
  };

  return this.problemSolvingStats;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;