// App.js
import React from 'react';
import Dashboard from './Components/Dashboard';
import { CssBaseline } from '@mui/material'; // only keep CssBaseline
import { withAuthenticator, ThemeProvider as AmplifyThemeProvider, defaultDarkModeOverride } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const amplifyTheme = {
  name: 'custom-theme',
  overrides: [defaultDarkModeOverride],
  tokens: {
    colors: {
      brand: {
        primary: { 10: '#e6f2ff', 80: '#1976d2', 100: '#155fa6' },
      },
      font: {
        primary: { value: '#0f172a' },
      },
    },
    radii: { small: '10px', medium: '14px', large: '18px' },
    components: {
      button: { 
        primary: { 
          backgroundColor: { value: '#1976d2' }, 
          _hover: { backgroundColor: { value: '#155fa6' } } 
        } 
      },
      fieldcontrol: { 
        borderColor: { value: '#94a3b8' }, 
        borderRadius: { value: '10px' } 
      }
    }
  }
};

function App({ signOut, user }) {
  return (
    <AmplifyThemeProvider theme={amplifyTheme}>
      <CssBaseline />
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b1220' }}>
        <div style={{ color: 'white' }}>
          Welcome, {user?.username}
          <button onClick={signOut} style={{ marginLeft: 16 }}>Sign Out</button>
          <Dashboard />
        </div>
      </div>
    </AmplifyThemeProvider>
  );
}

export default withAuthenticator(App, {
  signUpAttributes: ['email'],
  loginMechanisms: ['email'],
  socialProviders: [],                 
  formFields: {
    signIn: {
      username: {
        label: 'Email',
        placeholder: 'you@company.com',
      },
    },
  },
});
