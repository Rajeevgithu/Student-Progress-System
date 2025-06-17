import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    emailFrequency: 'daily',
    cronFrequency: '6h',
    inactivityThreshold: 7,
    emailTemplate: '',
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch settings');
      console.error('Error fetching settings:', err);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings', settings);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error updating settings:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography>Loading settings...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardContent>
          <Typography variant="h5" component="div" className="mb-6">
            System Settings
          </Typography>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleChange('emailNotifications')}
                    />
                  }
                  label="Enable Email Notifications"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Email Frequency"
                  value={settings.emailFrequency}
                  onChange={handleChange('emailFrequency')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Codeforces Data Sync Frequency"
                  value={settings.cronFrequency}
                  onChange={handleChange('cronFrequency')}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="1h">Every Hour</option>
                  <option value="6h">Every 6 Hours</option>
                  <option value="12h">Every 12 Hours</option>
                  <option value="24h">Every 24 Hours</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Inactivity Threshold (days)"
                  value={settings.inactivityThreshold}
                  onChange={handleChange('inactivityThreshold')}
                  InputProps={{ inputProps: { min: 1, max: 30 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Email Template"
                  value={settings.emailTemplate}
                  onChange={handleChange('emailTemplate')}
                  helperText="Use {name} and {handle} as placeholders"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Save Settings
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Settings updated successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings; 