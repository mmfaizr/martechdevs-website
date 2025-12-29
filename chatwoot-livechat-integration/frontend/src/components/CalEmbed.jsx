import React, { useEffect, useState } from 'react';

export default function CalEmbed({ calLink, onBookingComplete, onClose }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.cal.com/embed/embed.js';
    script.async = true;
    script.onload = () => {
      setIsLoading(false);
      if (window.Cal) {
        window.Cal('init', { origin: 'https://app.cal.com' });
        
        window.Cal('on', {
          action: 'bookingSuccessful',
          callback: (e) => {
            if (onBookingComplete) {
              onBookingComplete(e.detail);
            }
          }
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onBookingComplete]);

  const fullCalLink = calLink.startsWith('http') ? calLink : `https://cal.com/${calLink}`;

  return (
    <div className="cal-embed-container">
      <div className="cal-embed-header">
        <span>Schedule a Discovery Call</span>
        <button className="cal-close-btn" onClick={onClose}>×</button>
      </div>
      {isLoading && (
        <div className="cal-loading">
          <div className="cal-spinner"></div>
          <span>Loading calendar...</span>
        </div>
      )}
      <div 
        className="cal-embed-frame"
        data-cal-link={calLink}
        data-cal-config='{"layout":"column_view"}'
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
      >
        <iframe
          src={`${fullCalLink}?embed=true&theme=light&layout=column_view&hideEventTypeDetails=1`}
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '480px',
            border: 'none',
            borderRadius: '4px'
          }}
          title="Schedule a call"
        />
      </div>
    </div>
  );
}

