import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const Settings = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: {
      enabled: false,
      recipients: []
    },
    cronFrequency: 'daily',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      setError('Failed to fetch settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/settings', settings);
      setSuccess(true);
    } catch (error) {
      setError('Failed to save settings');
      console.error('Error saving settings:', error);
    }
  };

  const handleChange = (field) => (event) => {
    if (field === 'emailNotifications') {
      setSettings({
        ...settings,
        emailNotifications: {
          ...settings.emailNotifications,
          enabled: event.target.checked
        }
      });
    } else {
      setSettings({
        ...settings,
        [field]: event.target.value,
      });
    }
  };

  const SettingCard = ({ icon: Icon, title, children }) => (
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Icon sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Fade in timeout={500}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingCard icon={NotificationsIcon} title="Email Notifications">
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications?.enabled}
                    onChange={handleChange('emailNotifications')}
                    color="primary"
                  />
                }
                label="Enable email notifications"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Receive email notifications about student progress and achievements.
              </Typography>
            </SettingCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <SettingCard icon={ScheduleIcon} title="Update Frequency">
              <TextField
                select
                fullWidth
                value={settings.cronFrequency}
                onChange={handleChange('cronFrequency')}
                SelectProps={{
                  native: true,
                }}
                sx={{ mb: 2 }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </TextField>
              <Typography variant="body2" color="text.secondary">
                How often should the system check for updates?
              </Typography>
            </SettingCard>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Save Changes
          </Button>
        </Box>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Settings saved successfully!
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default Settings; 