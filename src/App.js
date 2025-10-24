import React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Dashboard from './Components/Dashboard';

// Create a basic theme if you haven't already
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ minHeight: '100vh' }}>
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;