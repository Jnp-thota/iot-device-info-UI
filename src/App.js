// App.js
import React from "react";
import { useAuth } from "react-oidc-context";
import { createTheme, ThemeProvider, CssBaseline, Button, CircularProgress } from "@mui/material";
import Dashboard from "./Components/Dashboard";

// Create a theme
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

function App() {
  const auth = useAuth();

  // Cognito logout redirect (replace placeholders)
  const signOutRedirect = () => {
    const clientId = "3osalugng6n9enq19uphjp2kvo"; // ✅ your Cognito app client ID
    const logoutUri = "https://main.d3hy3l4nr6c3jq.amplifyapp.com"; // ✅ your app URL after logout
    const cognitoDomain = "https://us-east-11hx6hbld1.auth.us-east-1.amazoncognito.com"; // ✅ replace this
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </div>
      </ThemeProvider>
    );
  }

  if (auth.error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <h3>Error: {auth.error.message}</h3>
          <Button variant="contained" onClick={() => auth.signinRedirect()}>
            Try Again
          </Button>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ minHeight: "100vh" }}>
        {auth.isAuthenticated ? (
          <>
            <Dashboard />
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <Button variant="contained" color="secondary" onClick={() => signOutRedirect()}>
                Sign Out
              </Button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", marginTop: "20%" }}>
            <Button variant="contained" color="primary" onClick={() => auth.signinRedirect()}>
              Sign In
            </Button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
