'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [scrapersRunning, setScrapersRunning] = useState(false);
  const [permitsOn, setPermitsOn] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsStructure, setLeadsStructure] = useState<any>({});

  const backendUrl = 'https://permits-back-end.onrender.com';

  // Run or stop scrapers
  const handleScraperAction = async () => {
    if (scrapersRunning) {
      // Stop scrapers
      try {
        const response = await fetch(${backendUrl}/api/stop-scrapers, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setScrapersRunning(false);
          alert('Scraper stop signal sent!');
          // Refresh logs immediately
          setTimeout(() => {
            fetchLogs();
          }, 1000);
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          alert(Error stopping scrapers:  - );
        }
      } catch (error) {
        console.error('Network error:', error);
        alert(Network error: );
      }
    } else {
      // Start scrapers
      setScrapersRunning(true);
      try {
        console.log('Starting scraper run...');
        const response = await fetch(${backendUrl}/api/run-scrapers, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response:', response);

        if (response.ok) {
          const result = await response.json();
          console.log('Scraper result:', result);
          alert('Scrapers completed successfully!');
          // Refresh logs and leads immediately after running
          setTimeout(() => {
            fetchLogs();
            fetchLeads();
          }, 1000);
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          alert(Error running scrapers:  - );
        }
      } catch (error) {
        console.error('Network error:', error);
        alert(Network error: );
      } finally {
        setScrapersRunning(false);
      }
    }
  };

  // Toggle permits
  const togglePermits = async () => {
    const newState = !permitsOn;
    try {
      const response = await fetch(${backendUrl}/api/switch/permits, {
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

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const response = await fetch(${backendUrl}/api/get-logs);
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n').slice(-20); // Get last 20 lines
        setLogs(lines);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const response = await fetch(${backendUrl}/last-week?cities=austin,nashville,sanantonio,houston,chattanooga,charlotte,phoenix);
      if (response.ok) {
        const data = await response.json();
        // Flatten all permits from all cities
        const allLeads = [];
        for (const [city, cityData] of Object.entries(data)) {
          if (city !== 'total_count' && city !== 'all_permits' && cityData.permits) {
            allLeads.push(...cityData.permits.map((permit: any) => ({
              ...permit,
              city: city
            })));
          }
        }
        setLeads(allLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  // Fetch leads structure
  const fetchLeadsStructure = async () => {
    try {
      const response = await fetch(${backendUrl}/api/get-leads-structure);
      if (response.ok) {
        const data = await response.json();
        setLeadsStructure(data);
      }
    } catch (error) {
      console.error('Error fetching leads structure:', error);
    }
  };

  // Fetch logs, leads, and leads structure every 10 seconds
  useEffect(() => {
    fetchLogs();
    fetchLeads();
    fetchLeadsStructure();
    const interval = setInterval(() => {
      fetchLogs();
      fetchLeads();
      fetchLeadsStructure();
    }, 10000);
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

      {/* Run/Stop Scrapers Button */}
      <div style={{ marginBottom: '40px' }}>
        <button
          onClick={handleScraperAction}
          style={{
            backgroundColor: scrapersRunning ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1.2rem',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          {scrapersRunning ? 'Stop Scrapers' : 'Run Scrapers Now'}
        </button>
      </div>

      {/* Toggle Switches */}
      <div style={{ marginBottom: '40px' }}>
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
      </div>

      {/* Logs Box */}
      <div style={{ width: '80%', maxWidth: '800px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Live Logs</h2>
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '5px',
          padding: '20px',
          height: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          whiteSpace: 'pre-wrap'
        }}>
          {logs.length > 0 ? logs.join('\n') : 'Loading logs...'}
        </div>
      </div>

      {/* Saved Leads Structure */}
      <div style={{ width: '80%', maxWidth: '800px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Saved Leads Structure</h2>
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '5px',
          padding: '20px',
          height: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          {leadsStructure.cities && leadsStructure.cities.length > 0 ? (
            leadsStructure.cities.map((cityData: any) => (
              <div key={cityData.name} style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                  📁 {cityData.name} ({cityData.dates.length} dates)
                </div>
                {cityData.dates.map((dateData: any) => (
                  <div key={dateData.date} style={{ marginLeft: '20px', marginBottom: '5px' }}>
                    📄 {dateData.date}: {dateData.permits} permits ({dateData.files} files)
                  </div>
                ))}
              </div>
            ))
          ) : (
            'Loading leads structure...'
          )}
        </div>
      </div>

      {/* Leads Box */}
      <div style={{ width: '80%', maxWidth: '800px' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Leads ({leads.length})</h2>
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '5px',
          padding: '20px',
          height: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          {leads.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {leads.slice(0, 20).map((lead, index) => (
                <div key={index} style={{
                  backgroundColor: '#2a2a2a',
                  padding: '10px',
                  borderRadius: '3px',
                  border: '1px solid #444'
                }}>
                  <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {lead.address || lead.location || 'Unknown Location'}
                  </div>
                  <div style={{ color: '#BBB', fontSize: '0.8rem', marginTop: '5px' }}>
                    {lead.permit_type || lead.type || 'Permit'} • {lead.date || lead.filed_date || 'Recent'}
                  </div>
                  {lead.description && (
                    <div style={{ color: '#DDD', fontSize: '0.8rem', marginTop: '5px' }}>
                      {lead.description.length > 100 ? lead.description.substring(0, 100) + '...' : lead.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            'Loading leads...'
          )}
        </div>
      </div>
    </div>
  );
}
