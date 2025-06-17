import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  useTheme,
  Fade,
  Avatar,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Code as CodeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import axios from 'axios';
import ContestHistory from '../components/ContestHistory';
import ProblemSolvingStats from '../components/student/ProblemSolvingStats';

const StudentProfile = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/students/${id}`);
      const data = response.data;

      setStudent({
        name: data.name || '',
        email: data.email || '',
        codeforcesHandle: data.codeforcesHandle || '',
        currentRating: data.currentRating ?? null,
        maxRating: data.maxRating ?? null,
        problemsSolved: data.problemsSolved ?? 0,
        rank: data.rank || '',
        contestHistory: data.contestHistory || [],
        problemSolvingStats: data.problemSolvingStats || {},
        recentActivity: data.recentActivity || [],
        solvedProblems: data.solvedProblems || [],
      });
    } catch (error) {
      setError('Failed to fetch student data');
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card
      sx={{
        height: '100%',
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
          {value ?? 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: 3 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '2rem',
                  mr: 3,
                }}
              >
                {student.name?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {student.name || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {student.email || 'N/A'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Codeforces Handle: {student.codeforcesHandle || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={TrendingUpIcon}
                  title="Current Rating"
                  value={student.currentRating ?? 'N/A'}
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={EmojiEventsIcon}
                  title="Max Rating"
                  value={student.maxRating ?? 'N/A'}
                  color={theme.palette.warning.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={CodeIcon}
                  title="Problems Solved"
                  value={student.problemsSolved ?? 'N/A'}
                  color={theme.palette.success.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={SchoolIcon}
                  title="Rank"
                  value={student.rank || 'Unranked'}
                  color={theme.palette.info.main}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Contest History
                </Typography>
                <ContestHistory contests={student.contestHistory || []} />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Problem Solving Statistics
                </Typography>
                <ProblemSolvingStats 
                  stats={student.problemSolvingStats || {}} 
                  problems={student.solvedProblems || []}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Recent Activity
                </Typography>
                <Timeline>
                  {(student.recentActivity || []).map((activity, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color={activity.type === 'contest' ? 'primary' : 'success'} />
                        {index < student.recentActivity.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {activity.title || 'Untitled'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.date || 'No date'}
                        </Typography>
                        <Typography variant="body2">
                          {activity.description || 'No description'}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default StudentProfile;
