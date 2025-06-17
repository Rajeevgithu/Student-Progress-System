import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';
import * as XLSX from 'xlsx';
import StudentModal from '../components/common/StudentModal';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageRating: 0,
    topPerformers: 0,
  });

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'cfHandle', headerName: 'Codeforces Handle', width: 150 },
    { field: 'currentRating', headerName: 'Current Rating', width: 130 },
    { field: 'maxRating', headerName: 'Max Rating', width: 130 },
    { field: 'rank', headerName: 'Rank', width: 130 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row);
            }}
            size="small"
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.light + '20',
              },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row);
            }}
            size="small"
            sx={{
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: theme.palette.error.light + '20',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students');
      const studentsWithIds = response.data.map((student, index) => ({
        ...student,
        id: student._id || index + 1,
      }));
      setStudents(studentsWithIds);
      calculateStats(studentsWithIds);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalStudents = data.length;
    const averageRating = totalStudents > 0 
      ? Math.round(data.reduce((acc, student) => acc + (student.currentRating || 0), 0) / totalStudents)
      : 0;
    const topPerformers = data.filter(student => (student.currentRating || 0) >= 2000).length;

    setStats({
      totalStudents,
      averageRating,
      topPerformers,
    });
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/students/${selectedStudent.id}`);
      fetchStudents();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedStudent) {
        await axios.put(`/api/students/${selectedStudent.id}`, formData);
      } else {
        await axios.post('/api/students', formData);
      }
      fetchStudents();
      setModalOpen(false);
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

  const handleRowClick = (params) => {
    navigate(`/student/${params.row.id}`);
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color: color, mr: 1 }} />
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            Student Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedStudent(null);
                setModalOpen(true);
              }}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
              }}
            >
              Add Student
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
              }}
            >
              Export CSV
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={PeopleIcon}
                title="Total Students"
                value={stats.totalStudents}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={TrendingUpIcon}
                title="Average Rating"
                value={stats.averageRating}
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={EmojiEventsIcon}
                title="Top Performers"
                value={stats.topPerformers}
                color={theme.palette.warning.main}
              />
            </Grid>
          </Grid>
        </Box>

        <Card sx={{ height: '600px' }}>
          <DataGrid
            rows={students}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            onRowClick={handleRowClick}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
                cursor: 'pointer',
              },
            }}
          />
        </Card>

        <StudentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          student={selectedStudent}
          isEdit={!!selectedStudent}
        />

        <ConfirmDeleteModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          itemName={selectedStudent?.name}
        />
      </Box>
    </Fade>
  );
};

export default Dashboard; 