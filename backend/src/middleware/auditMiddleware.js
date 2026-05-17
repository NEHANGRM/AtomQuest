const AuditLog = require('../models/AuditLog');

/**
 * Mongoose Plugin for Automatic Audit Logging
 * 
 * Attaches to schema 'save' and 'findOneAndUpdate' hooks to automatically
 * track previous values and new values for any document changes.
 */
module.exports = function auditPlugin(schema, options) {
  // Capture original document before save
  schema.pre('save', function (next) {
    if (!this.isNew) {
      // Create a snapshot of the original document
      this._originalDocs = this.$locals.original = Object.assign({}, this._doc);
    }
    next();
  });

  // Log changes after save
  schema.post('save', async function (doc) {
    try {
      // Try to extract user ID from standard places if attached to doc
      const userId = doc.user || doc.createdBy || doc.managerId || null;
      
      if (this.isNew) {
        if (userId) {
          await AuditLog.create({
            user: userId,
            action: `CREATE_${doc.constructor.modelName.toUpperCase()}`,
            model: doc.constructor.modelName,
            documentId: doc._id,
            previousValue: null,
            newValue: doc.toObject()
          });
        }
      } else {
        const original = this.$locals.original;
        
        // Find modified fields
        const modifiedPaths = this.modifiedPaths();
        if (modifiedPaths.length > 0 && userId) {
          const previousValue = {};
          const newValue = {};
          
          modifiedPaths.forEach(path => {
            if (path !== 'updatedAt') {
              previousValue[path] = original[path];
              newValue[path] = doc[path];
            }
          });

          if (Object.keys(newValue).length > 0) {
            await AuditLog.create({
              user: userId,
              action: `UPDATE_${doc.constructor.modelName.toUpperCase()}`,
              model: doc.constructor.modelName,
              documentId: doc._id,
              previousValue,
              newValue
            });
          }
        }
      }
    } catch (error) {
      console.error('Audit Plugin Error:', error);
    }
  });

  // Track findOneAndUpdate (often used in Express REST APIs)
  schema.pre('findOneAndUpdate', async function (next) {
    this._original = await this.model.findOne(this.getQuery());
    next();
  });

  schema.post('findOneAndUpdate', async function (doc) {
    if (!doc || !this._original) return;
    try {
      const userId = doc.user || doc.createdBy || doc.managerId || null;
      if (!userId) return;

      const previousValue = {};
      const newValue = {};
      
      const updateObj = this.getUpdate();
      let changedKeys = [];
      if (updateObj.$set) changedKeys = Object.keys(updateObj.$set);
      else changedKeys = Object.keys(updateObj).filter(k => !k.startsWith('$'));

      changedKeys.forEach(key => {
        if (key !== 'updatedAt' && JSON.stringify(this._original[key]) !== JSON.stringify(doc[key])) {
          previousValue[key] = this._original[key];
          newValue[key] = doc[key];
        }
      });

      if (Object.keys(newValue).length > 0) {
        await AuditLog.create({
          user: userId,
          action: `UPDATE_${doc.constructor.modelName.toUpperCase()}`,
          model: doc.constructor.modelName,
          documentId: doc._id,
          previousValue,
          newValue
        });
      }
    } catch (error) {
      console.error('Audit Plugin Error:', error);
    }
  });
};
