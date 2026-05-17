const mongoose = require('mongoose');

const goalSheetSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: String, required: true },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'returned'], default: 'draft' },
  managerComments: { type: String },
  goals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }]
}, { timestamps: true });

const auditPlugin = require('../middleware/auditMiddleware');
goalSheetSchema.plugin(auditPlugin);

module.exports = mongoose.model('GoalSheet', goalSheetSchema);
