import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const ContestHistory = ({ contests }) => {
  const getRatingChangeColor = (change) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  const getRatingChangeIcon = (change) => {
    if (change > 0) return <TrendingUp fontSize="small" />;
    if (change < 0) return <TrendingDown fontSize="small" />;
    return null;
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Contest Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Rank</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Change</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contests.map((contest, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {contest.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(contest.date).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {contest.rank}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {contest.rating}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  icon={getRatingChangeIcon(contest.ratingChange)}
                  label={contest.ratingChange > 0 ? `+${contest.ratingChange}` : contest.ratingChange}
                  color={getRatingChangeColor(contest.ratingChange)}
                  size="small"
                  sx={{ minWidth: '80px' }}
                />
              </TableCell>
            </TableRow>
          ))}
          {contests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No contest history available
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContestHistory; 