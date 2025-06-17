const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET settings
router.get('/', async (req, res) => {
  try {
    console.log('Fetching settings...');
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('No settings found, creating default settings');
      settings = await Settings.create({
        emailNotifications: {
          enabled: true,
          recipients: []
        },
        cronFrequency: 'daily'
      });
    }
    
    console.log('Settings fetched successfully:', settings);
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ 
      error: 'Failed to fetch settings',
      message: err.message 
    });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    console.log('Updating settings:', req.body);
    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('No settings found, creating new settings');
      const newSettings = await Settings.create(req.body);
      return res.json(newSettings);
    }
    
    Object.assign(settings, req.body);
    settings.lastUpdated = new Date();
    await settings.save();
    
    console.log('Settings updated successfully:', settings);
    res.json(settings);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ 
      error: 'Failed to update settings',
      message: err.message 
    });
  }
});

module.exports = router; 