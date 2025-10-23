// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals



import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';
import { AuthProvider } from "react-oidc-context";
// import reportWebVitals from './reportWebVitals';
const cognitoAuthConfig = {
  authority: "https://us-east-11hx6hbld1.auth.us-east-1.amazoncognito.com",
  client_id: "3osalugng6n9enq19uphjp2kvo",
  redirect_uri: "https://main.d3hy3l4nr6c3jq.amplifyapp.com",
  post_logout_redirect_uri: "https://main.d3hy3l4nr6c3jq.amplifyapp.com",
  response_type: "code",
  scope: "openid email profile",
  loadUserInfo: true,
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);


// reportWebVitals();