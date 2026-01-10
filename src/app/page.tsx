'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [scrapersRunning, setScrapersRunning] = useState(false);
  const [permitsOn, setPermitsOn] = useState(true);
  const [soldOn, setSoldOn] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const backendUrl = 'https://permits-back-end.onrender.com';

  // Run scrapers
  const runScrapers = async () => {
    setScrapersRunning(true);
    try {
      const response = await fetch(`${backendUrl}/api/run-scrapers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Scrapers completed successfully!');
      } else {
        alert('Error running scrapers');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error running scrapers');
    } finally {
      setScrapersRunning(false);
    }
  };

  // Toggle permits
  const togglePermits = async () => {
    const newState = !permitsOn;
    try {
      const response = await fetch(`${backendUrl}/api/switch/permits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ on: newState }),
      });

      if (response.ok) {
        setPermitsOn(newState);
      } else {
        alert('Error toggling permits');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error toggling permits');
    }
  };

  // Toggle sold properties
  const toggleSold = async () => {
    const newState = !soldOn;
    try {
      const response = await fetch(`${backendUrl}/api/switch/sold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ on: newState }),
      });

      if (response.ok) {
        setSoldOn(newState);
      } else {
        alert('Error toggling sold properties');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error toggling sold properties');
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/get-logs`);
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n').slice(-20); // Get last 20 lines
        setLogs(lines);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Fetch logs every 10 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ marginBottom: '40px', fontSize: '2rem' }}>Admin Dashboard</h1>

      {/* Run Scrapers Button */}
      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={runScrapers}
          disabled={scrapersRunning}
          style={{
            backgroundColor: scrapersRunning ? '#666' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1.2rem',
            borderRadius: '5px',
            cursor: scrapersRunning ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace'
          }}
        >
          {scrapersRunning ? 'Running...' : 'Run Scrapers Now'}
        </button>
      </div>

      {/* Toggle Switches */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        {/* Permits Toggle */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Permits</div>
          <button
            onClick={togglePermits}
            style={{
              backgroundColor: permitsOn ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'monospace',
              minWidth: '120px'
            }}
          >
            {permitsOn ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Sold Properties Toggle */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px', fontSize: '1.1rem' }}>Sold Properties</div>
          <button
            onClick={toggleSold}
            style={{
              backgroundColor: soldOn ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'monospace',
              minWidth: '120px'
            }}
          >
            {soldOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Logs Box */}
      <div style={{ width: '80%', maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '20px' }}>Live Logs</h2>
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '5px',
          padding: '20px',
          height: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          whiteSpace: 'pre-wrap'
        }}>
          {logs.length > 0 ? logs.join('\n') : 'Loading logs...'}
        </div>
      </div>
    </div>
  );
}
