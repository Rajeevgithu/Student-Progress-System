import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';

const ContestHistory = ({ contests }) => {
  const [timeRange, setTimeRange] = useState(30); // days

  const filteredContests = contests.filter(contest => {
    const contestDate = new Date(contest.date);
    const now = new Date();
    const diffTime = Math.abs(now - contestDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= timeRange;
  });

  const chartData = {
    labels: filteredContests.map(contest => new Date(contest.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Rating',
        data: filteredContests.map(contest => contest.rating),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Card className="mb-6">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Contest History</Typography>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => setTimeRange(30)}
              variant={timeRange === 30 ? 'contained' : 'outlined'}
            >
              30 Days
            </Button>
            <Button
              onClick={() => setTimeRange(90)}
              variant={timeRange === 90 ? 'contained' : 'outlined'}
            >
              90 Days
            </Button>
            <Button
              onClick={() => setTimeRange(365)}
              variant={timeRange === 365 ? 'contained' : 'outlined'}
            >
              1 Year
            </Button>
          </ButtonGroup>
        </div>

        <div className="h-[300px] mb-6">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                },
              },
            }}
          />
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Contest</TableCell>
                <TableCell>Rank</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Change</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContests.map((contest, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(contest.date).toLocaleDateString()}</TableCell>
                  <TableCell>{contest.name}</TableCell>
                  <TableCell>{contest.rank}</TableCell>
                  <TableCell>{contest.rating}</TableCell>
                  <TableCell
                    className={
                      contest.ratingChange > 0
                        ? 'text-green-600'
                        : contest.ratingChange < 0
                        ? 'text-red-600'
                        : ''
                    }
                  >
                    {contest.ratingChange > 0 ? '+' : ''}
                    {contest.ratingChange}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ContestHistory; 