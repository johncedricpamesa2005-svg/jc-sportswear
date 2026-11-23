import React, { useEffect, useState } from 'react';

export default function OfflineBanner({ apiOffline = false }) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (isOnline && !apiOffline) return null;

  return (
    <div
      className="alert alert-warning border-0 rounded-0 mb-0 py-2 px-3 text-center d-flex align-items-center justify-content-center gap-2 shadow-sm"
      role="alert"
      style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 1025,
        fontSize: '0.88rem'
      }}
    >
      <i className="bi bi-wifi-off text-danger fs-5" />
      <span>
        <strong>Offline Mode:</strong>{' '}
        {!isOnline
          ? 'You are currently offline. Viewing cached data from your device.'
          : 'Unable to reach the server. Showing previously cached data.'}
      </span>
    </div>
  );
}
