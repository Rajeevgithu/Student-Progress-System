const express = require('express');
const router = express.Router();
const  Student  = require('../models/Student');
const { CodeforcesData } = require('../models/CodeforcesData');
const { Parser } = require('json2csv');
const inactivityService = require('../services/inactivityService');

// GET all students
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all students...');
    const students = await Student.find().lean();
    console.log(`Found ${students.length} students`);
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ 
      error: 'Failed to fetch students',
      message: err.message 
    });
  }
});

// POST a new student
router.post('/', async (req, res) => {
  try {
    console.log('Creating new student:', req.body);
    const student = new Student(req.body);
    await student.save();
    console.log('Student created successfully:', student);
    res.status(201).json(student);
  } catch (err) {
    console.error('Error creating student:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: err.message 
      });
    }
    res.status(500).json({ 
      error: 'Failed to create student',
      message: err.message 
    });
  }
});

// PUT update student by ID
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating student ${req.params.id}:`, req.body);
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      console.log(`Student not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('Student updated successfully:', student);
    res.json(student);
  } catch (err) {
    console.error('Error updating student:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: err.message 
      });
    }
    res.status(500).json({ 
      error: 'Failed to update student',
      message: err.message 
    });
  }
});

// DELETE student by ID
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Deleting student ${req.params.id}`);
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      console.log(`Student not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('Student deleted successfully');
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ 
      error: 'Failed to delete student',
      message: err.message 
    });
  }
});

// GET /students/export — Export all students to CSV
router.get('/export', async (req, res) => {
  try {
    console.log('Exporting students to CSV');
    const students = await Student.find().lean();
    const parser = new Parser();
    const csv = parser.parse(students);
    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting students:', err);
    res.status(500).json({ 
      error: 'Failed to export CSV',
      message: err.message 
    });
  }
});

// PUT /students/:id/email — Toggle email notifications
router.put('/:id/email', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.emailDisabled = req.body.disabled;
    await student.save();
    res.json({ emailDisabled: student.emailDisabled });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update email setting' });
  }
});

// Toggle email reminders for a student
router.patch('/:id/email-reminders', async (req, res) => {
  try {
    const { enabled } = req.body;
    const student = await inactivityService.toggleEmailReminders(req.params.id, enabled);
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reminder statistics for a student
router.get('/:id/reminder-stats', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      reminderEmailsSent: student.reminderEmailsSent,
      lastReminderSent: student.lastReminderSent,
      emailRemindersEnabled: student.emailRemindersEnabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student', message: err.message });
  }
});

module.exports = router;
