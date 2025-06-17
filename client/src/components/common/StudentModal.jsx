import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';

const StudentModal = ({ open, onClose, onSubmit, student, isEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cfHandle: '',
    currentRating: '',
    maxRating: '',
    rank: '',
    phone: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        cfHandle: student.cfHandle || '',
        currentRating: student.currentRating || '',
        maxRating: student.maxRating || '',
        rank: student.rank || '',
        phone: student.phone || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        cfHandle: '',
        currentRating: '',
        maxRating: '',
        rank: '',
        phone: '',
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert numeric fields to numbers
    const processedData = {
      ...formData,
      currentRating: Number(formData.currentRating),
      maxRating: Number(formData.maxRating),
    };
    onSubmit(processedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {isEdit ? 'Edit Student' : 'Add New Student'}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="cfHandle"
              label="Codeforces Handle"
              value={formData.cfHandle}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="currentRating"
              label="Current Rating"
              type="number"
              value={formData.currentRating}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="maxRating"
              label="Max Rating"
              type="number"
              value={formData.maxRating}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="rank"
              label="Rank"
              value={formData.rank}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Add Student'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StudentModal; 