import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const StudentProfile = ({ studentId }) => {
  const [timeRange, setTimeRange] = useState("30");
  const [contestData, setContestData] = useState([]);
  const [problemData, setProblemData] = useState({ ratingBuckets: [] });
  const [metrics, setMetrics] = useState({});
  const [reminderStats, setReminderStats] = useState({});
  const [showReminderInfo, setShowReminderInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([fetchContestData(), fetchProblemData(), fetchReminderStats()])
      .then(() => setLoading(false))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch student data");
        setLoading(false);
      });
  }, [studentId, timeRange]);

  useEffect(() => {
    console.log('problemData:', problemData);
    console.log('problemData.ratingBuckets:', problemData?.ratingBuckets);
  }, [problemData]);

  const fetchContestData = async () => {
    try {
      const response = await axios.get(`/api/students/${studentId}/contests`, {
        params: { days: timeRange },
      });
      setContestData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setContestData([]);
      throw error;
    }
  };

  const fetchProblemData = async () => {
    try {
      const response = await axios.get(`/api/students/${studentId}/problems`, {
        params: { days: timeRange },
      });

      const data = response.data || {};
      const safeBuckets = Array.isArray(data.ratingBuckets)
        ? data.ratingBuckets
        : [];

      setProblemData({ ratingBuckets: safeBuckets });
      setMetrics(data.metrics || {});
    } catch (error) {
      setProblemData({ ratingBuckets: [] });
      setMetrics({});
      throw error;
    }
  };

  const fetchReminderStats = async () => {
    try {
      const response = await axios.get(
        `/api/students/${studentId}/reminder-stats`
      );
      setReminderStats(response.data || {});
    } catch (error) {
      setReminderStats({});
      throw error;
    }
  };

  const handleReminderToggle = async (event) => {
    try {
      await axios.patch(`/api/students/${studentId}/email-reminders`, {
        enabled: event.target.checked,
      });
      fetchReminderStats();
    } catch (error) {
      console.error("Error toggling reminders:", error);
    }
  };

  const contestChartData = {
    labels: Array.isArray(contestData)
      ? contestData.map((contest) =>
          new Date(contest.date).toLocaleDateString()
        )
      : [],
    datasets: [
      {
        label: "Rating",
        data: Array.isArray(contestData)
          ? contestData.map((contest) => contest.rating)
          : [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const problemChartData = {
    labels: Array.isArray(problemData && problemData.ratingBuckets) ? problemData.ratingBuckets.map(bucket => bucket.range) : [],
    datasets: [
      {
        label: 'Problems Solved',
        data: Array.isArray(problemData && problemData.ratingBuckets) ? problemData.ratingBuckets.map(bucket => bucket.count) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  if (loading)
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Email Reminder Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  Email Reminder Settings
                </Typography>
                <Tooltip title="Learn more about email reminders">
                  <IconButton
                    onClick={() => setShowReminderInfo(true)}
                    size="small"
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={reminderStats?.emailRemindersEnabled || false}
                    onChange={handleReminderToggle}
                  />
                }
                label="Enable email reminders for inactivity"
              />
              {reminderStats && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Reminders sent: {reminderStats.reminderEmailsSent ?? 0}
                  {reminderStats.lastReminderSent && (
                    <>
                      {" "}
                      • Last sent:{" "}
                      {new Date(
                        reminderStats.lastReminderSent
                      ).toLocaleDateString()}
                    </>
                  )}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Contest History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Contest History</Typography>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="30">30 Days</MenuItem>
                  <MenuItem value="90">90 Days</MenuItem>
                  <MenuItem value="365">365 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 300 }}>
              <Line
                data={contestChartData}
                options={{ maintainAspectRatio: false }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Problem Solving Data Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Problem Solving Data</Typography>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="7">7 Days</MenuItem>
                  <MenuItem value="30">30 Days</MenuItem>
                  <MenuItem value="90">90 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Metrics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Most Difficult Problem
                    </Typography>
                    <Typography variant="h6">
                      {metrics?.mostDifficultProblem || "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Solved
                    </Typography>
                    <Typography variant="h6">
                      {metrics?.totalSolved ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Rating
                    </Typography>
                    <Typography variant="h6">
                      {metrics?.averageRating ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Per Day
                    </Typography>
                    <Typography variant="h6">
                      {metrics?.averagePerDay ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Problems by Rating Chart */}
            <Box sx={{ height: 300 }}>
              {Array.isArray(problemData && problemData.ratingBuckets) && problemData.ratingBuckets.length > 0 ? (
                <Bar data={problemChartData} options={{ maintainAspectRatio: false }} />
              ) : (
                <Typography>No problem data available.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Reminder Info Dialog */}
      <Dialog
        open={showReminderInfo}
        onClose={() => setShowReminderInfo(false)}
      >
        <DialogTitle>About Email Reminders</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Email reminders are sent automatically when a student hasn't made
            any submissions on Codeforces for 7 days.
          </Typography>
          <Typography paragraph>The system will:</Typography>
          <ul>
            <li>Check for inactivity daily</li>
            <li>Send a reminder email if no submissions for 7 days</li>
            <li>Wait at least 7 days between reminders</li>
            <li>Track the number of reminders sent</li>
          </ul>
          <Typography>
            You can disable these reminders at any time using the toggle switch.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReminderInfo(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfile;
