import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  useTheme,
} from '@mui/material';

const ProblemSolvingStats = ({ stats }) => {
  const theme = useTheme();

  const difficultyColors = {
    'A': theme.palette.success.main,
    'B': theme.palette.info.main,
    'C': theme.palette.warning.main,
    'D': theme.palette.error.main,
    'E': theme.palette.secondary.main,
    'F': theme.palette.primary.main,
  };

  const StatCard = ({ title, value, color }) => (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );

  const DifficultyProgress = ({ difficulty, solved, total }) => {
    const percentage = (solved / total) * 100;
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Problem {difficulty}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {solved}/{total}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              backgroundColor: difficultyColors[difficulty],
            },
          }}
        />
      </Box>
    );
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Problems Solved"
            value={stats.totalSolved}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={stats.averageRating}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Max Rating"
            value={stats.maxRating}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contests Participated"
            value={stats.contestsParticipated}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Problems by Difficulty
        </Typography>
        {Object.entries(stats.difficultyStats).map(([difficulty, { solved, total }]) => (
          <DifficultyProgress
            key={difficulty}
            difficulty={difficulty}
            solved={solved}
            total={total}
          />
        ))}
      </Paper>
    </Box>
  );
};

export default ProblemSolvingStats; 