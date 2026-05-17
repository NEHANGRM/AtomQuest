const mongoose = require('mongoose');

const checkInSchema = mongoose.Schema({
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
  actualValue: { type: Number, required: true },
  status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], required: true },
  comments: { type: String },
  managerComment: { type: String },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
