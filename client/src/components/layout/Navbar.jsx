import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  useTheme,
  Tooltip
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const theme = useTheme();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        color: darkMode ? '#f3f4f6' : '#1f2937',
        borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: darkMode ? '#f9fafb' : '#111827',
          }}
        >
          Student Progress System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                color: isActive(item.path)
                  ? theme.palette.primary.main
                  : darkMode
                  ? '#d1d5db'
                  : '#4b5563',
                backgroundColor: isActive(item.path)
                  ? darkMode
                    ? '#374151'
                    : '#f3f4f6'
                  : 'transparent',
                fontWeight: isActive(item.path) ? 'bold' : 500,
                borderRadius: '8px',
                px: 2,
                py: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                  color: darkMode ? '#fff' : '#111827',
                },
              }}
            >
              {item.label}
            </Button>
          ))}

          <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                color: darkMode ? '#fcd34d' : '#4b5563',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'rotate(20deg)',
                  color: darkMode ? '#fde68a' : '#1f2937',
                },
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
