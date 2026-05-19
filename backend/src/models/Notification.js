const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'action_required'], default: 'info' },
  read: { type: Boolean, default: false },
  relatedEntity: {
    entityModel: { type: String, enum: ['Goal', 'GoalSheet', 'CheckIn', 'User'] },
    entityId: { type: mongoose.Schema.Types.ObjectId }
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
