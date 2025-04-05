import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import App from './App.tsx'
import './index.css'

// Initialize GA4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (GA_MEASUREMENT_ID) {
  try {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("[GA4] Initialized with ID:", GA_MEASUREMENT_ID);
    // Optionally send initial pageview if needed, though AnalyticsTracker will handle subsequent ones
    // ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
  } catch (error) {
    console.error("[GA4] Initialization error:", error);
  }
} else {
  console.warn("[GA4] Measurement ID not found (VITE_GA_MEASUREMENT_ID). Analytics will not be sent.");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
