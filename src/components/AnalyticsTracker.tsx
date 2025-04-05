import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if GA was initialized before sending
    if (ReactGA.isInitialized) {
      try {
        const pagePath = location.pathname + location.search + location.hash;
        ReactGA.send({
          hitType: "pageview",
          page: pagePath,
          title: document.title // Send page title dynamically
        });
        console.log(`[GA4] Pageview Sent: ${pagePath}`);
      } catch (error) {
          console.error("[GA4] Error sending pageview:", error);
      }
    }
  }, [location]); // Re-run effect when location changes

  return null; // This component does not render anything
};

export default AnalyticsTracker; 