import React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Dashboard from './Components/Dashboard';
import { AuthProvider, useAuth } from 'react-oidc-context';

// Configure Cognito OIDC
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_wHau8EIYF", // replace with your user pool authority
  client_id: "39l93as6a8smtn5o7nj2hovf2s", // replace with your App Client ID
  redirect_uri: "https://main.d3hy3l4nr6c3jq.amplifyapp.com", // your Amplify app URL
  response_type: "code",
  scope: "phone openid email profile",
};

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// A wrapper component to handle auth logic
function AppContent() {
  const auth = useAuth();

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (!auth.isAuthenticated) {
    return <button onClick={() => auth.signinRedirect()}>Sign in</button>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <button onClick={() => auth.removeUser()}>Sign out</button>
      <Dashboard />
    </div>
  );
}

function App() {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
