const mongoose = require('mongoose');

const checkInSchema = mongoose.Schema({
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  comments: { type: String, required: true },
  performanceRating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
