import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Grid } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CodeforcesProfile = ({ handle }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [handle]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/codeforces/verify/${handle}`);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch Codeforces profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const ratingData = {
    labels: profile.ratingHistory.map(r => new Date(r.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Rating',
        data: profile.ratingHistory.map(r => r.rating),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-6">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h5" component="div" className="mb-4">
                Profile Overview
              </Typography>
              <div className="space-y-2">
                <Typography variant="body1">
                  <span className="font-bold">Handle:</span> {profile.handle}
                </Typography>
                <Typography variant="body1">
                  <span className="font-bold">Current Rating:</span> {profile.currentRating}
                </Typography>
                <Typography variant="body1">
                  <span className="font-bold">Max Rating:</span> {profile.maxRating}
                </Typography>
                <Typography variant="body1">
                  <span className="font-bold">Rank:</span> {profile.rank}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h5" component="div" className="mb-4">
                Rating History
              </Typography>
              <div className="h-[300px]">
                <Line data={ratingData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: false,
                    },
                  },
                }} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div" className="mb-4">
                Problem Statistics
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(profile.problemStats).map(([difficulty, count]) => (
                  <Grid item xs={6} sm={4} md={2} key={difficulty}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" className="text-center">
                          {difficulty}
                        </Typography>
                        <Typography variant="h4" className="text-center font-bold">
                          {count}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CodeforcesProfile; 