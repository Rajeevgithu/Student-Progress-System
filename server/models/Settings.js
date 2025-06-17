const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  emailNotifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    recipients: [{
      type: String,
      trim: true
    }]
  },
  cronFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  const count = await this.constructor.countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error('Only one settings document can exist');
  }
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

// Create default settings if none exist
Settings.findOne().then(settings => {
  if (!settings) {
    Settings.create({
      emailNotifications: {
        enabled: true,
        recipients: []
      },
      cronFrequency: 'daily'
    });
  }
});

module.exports = Settings; 