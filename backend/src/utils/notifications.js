const Notification = require('../models/Notification');

const triggerNotification = async (userId, title, message, type = 'info', relatedEntity = null) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedEntity
    });
    console.log(`[Notification] Created for user ${userId}: "${title}"`);
  } catch (error) {
    console.error('[Notification] Failed to create notification:', error.message);
  }
};

module.exports = { triggerNotification };
