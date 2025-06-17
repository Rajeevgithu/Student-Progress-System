import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import axios from 'axios';
import * as XLSX from 'xlsx';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    codeforcesHandle: '',
    lastActive: new Date(),
  });

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'codeforcesHandle', headerName: 'Codeforces Handle', width: 150 },
    { field: 'lastActive', headerName: 'Last Active', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData(student);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStudent) {
        await axios.put(`/api/students/${selectedStudent.id}`, formData);
      } else {
        await axios.post('/api/students', formData);
      }
      setOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleExportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students.xlsx');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <div className="space-x-2">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedStudent(null);
              setFormData({
                name: '',
                email: '',
                codeforcesHandle: '',
                lastActive: new Date(),
              });
              setOpen(true);
            }}
          >
            Add Student
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="h-[600px] w-full">
        <DataGrid
          rows={students}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Codeforces Handle"
              value={formData.codeforcesHandle}
              onChange={(e) => setFormData({ ...formData, codeforcesHandle: e.target.value })}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedStudent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentList; 