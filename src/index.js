// index.js or index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import './App.css'; // Import the global CSS file
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
