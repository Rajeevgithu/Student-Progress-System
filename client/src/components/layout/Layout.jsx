import React from 'react';
import { Container, Box } from '@mui/material';
import Navbar from './Navbar';

/**
 * Layout component wraps all pages with a consistent navbar and layout spacing.
 * Applies dark/light background based on the `darkMode` prop.
 */
const Layout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: darkMode ? 'grey.900' : 'grey.100',
        color: darkMode ? 'grey.100' : 'grey.900',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
