const mongoose = require('mongoose');

const sharedGoalSchema = mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thrustArea: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  uomType: { type: String, enum: ['Numeric', 'Percentage', 'Timeline', 'Zero-based'], required: true },
  direction: { type: String, enum: ['Higher', 'Lower'], default: 'Higher' },
  target: { type: Number, required: true },
  timeline: { type: String, required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const auditPlugin = require('../middleware/auditMiddleware');
sharedGoalSchema.plugin(auditPlugin);

module.exports = mongoose.model('SharedGoal', sharedGoalSchema);
