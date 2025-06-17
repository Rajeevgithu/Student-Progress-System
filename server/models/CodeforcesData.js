const mongoose = require('mongoose');

const cfDataSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  contestHistory: [{
    contestId: Number,
    name: String,
    ratingChange: Number,
    rank: Number,
    date: Date,
  }],
  submissions: [{
    problemId: String,
    rating: Number,
    solved: Boolean,
    date: Date,
  }],
});

module.exports = mongoose.model('CodeforcesData', cfDataSchema);
