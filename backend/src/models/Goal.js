const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalSheet: { type: mongoose.Schema.Types.ObjectId, ref: 'GoalSheet', required: true },
  thrustArea: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  uomType: { type: String, enum: ['Numeric', 'Percentage', 'Timeline', 'Zero-based'], required: true },
  direction: { type: String, enum: ['Higher', 'Lower'], default: 'Higher' },
  target: { type: Number, required: true },
  weightage: { type: Number, required: true, min: 10, max: 100 },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], default: 'Not Started' },
  isShared: { type: Boolean, default: false },
  sharedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'SharedGoal', default: null },
  achievements: [{
    quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], required: true },
    actualValue: { type: Number, required: true },
    comments: { type: String },
    date: { type: Date, default: Date.now }
  }],
  progressScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
