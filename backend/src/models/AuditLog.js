const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  model: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  previousValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
