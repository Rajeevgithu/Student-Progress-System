import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Grid,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProblemSolvingStats = ({ problems = [], stats = {} }) => {
  const [timeRange, setTimeRange] = useState(30);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Debug logging
    console.log('ProblemSolvingStats props:', { problems, stats });
    setDebugInfo({
      hasProblems: Array.isArray(problems),
      problemsLength: Array.isArray(problems) ? problems.length : 0,
      hasStats: typeof stats === 'object' && stats !== null,
      statsKeys: Object.keys(stats || {}),
    });
  }, [problems, stats]);

  // Ensure stats is always an object with default values
  const safeStats = {
    totalSolved: 0,
    solvedLast30Days: 0,
    solvedLast90Days: 0,
    averageRating: 0,
    averagePerDay: 0,
    ratingBuckets: {},
    submissionHeatmap: [],
    ...(typeof stats === 'object' && stats !== null ? stats : {})
  };

  const difficultyDistribution = {
    labels: Object.keys(safeStats.ratingBuckets || {}),
    datasets: [
      {
        label: "Problems Solved",
        data: Object.values(safeStats.ratingBuckets || {}),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const heatmapData = Array.isArray(safeStats.submissionHeatmap) 
    ? safeStats.submissionHeatmap 
    : [];

  return (
    <Card className="mb-6">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Problem Solving Statistics</Typography>
          <ButtonGroup variant="outlined" size="small">
            {[7, 30, 90].map((range) => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                variant={timeRange === range ? "contained" : "outlined"}
              >
                {range} Days
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <pre style={{ fontSize: '10px', color: '#666', marginBottom: '10px' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}

        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Solved
                </Typography>
                <Typography variant="h4">{safeStats.totalSolved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Last 30 Days
                </Typography>
                <Typography variant="h4">{safeStats.solvedLast30Days}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Rating
                </Typography>
                <Typography variant="h4">{Math.round(safeStats.averageRating)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Per Day
                </Typography>
                <Typography variant="h4">{safeStats.averagePerDay.toFixed(1)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <div className="h-[300px] mb-6">
          <Bar
            id="problem-solving-stats-chart"
            data={difficultyDistribution}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>

        <div className="mb-6">
          <Typography variant="h6" className="mb-4">
            Activity Heatmap
          </Typography>
          <CalendarHeatmap
            startDate={new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000)}
            endDate={new Date()}
            values={heatmapData}
            classForValue={(value) =>
              value ? `color-scale-${Math.min(value.count, 4)}` : "color-empty"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemSolvingStats;
