
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminTripPlans() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // For sidebar hover effect
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fetch trip plans on mount
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get('http://localhost:8080/api/admin/trip-plans', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips(res.data);
      } catch (err) {
        console.error('Error fetching trip plans:', err);
        setError('Failed to fetch trip plans.');
      }
    };
    fetchTrips();
  }, []);

  // Delete a trip plan
  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:8080/api/admin/trip-plans/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(trips.filter(trip => trip._id !== tripId));
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip.');
    }
  };

  // Mark a trip as completed
  const handleMarkCompleted = async (tripId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`http://localhost:8080/api/admin/trip-plans/${tripId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(trips.map(trip => {
        if (trip._id === tripId) {
          return { ...trip, status: 'completed' };
        }
        return trip;
      }));
    } catch (err) {
      console.error('Error marking trip as completed:', err);
      setError('Failed to mark trip as completed.');
    }
  };

  // Sidebar hover logic
  const handleMouseEnter = (index) => setHoveredItem(index);
  const handleMouseLeave = () => setHoveredItem(null);
  const getSidebarItemDynamicStyle = (index) => {
    return hoveredItem === index
      ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
      : {};
  };

  // Layout styles 
  const containerStyle = {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    margin: 0,
    padding: 0,
    fontFamily: "'Roboto', sans-serif",
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  // Sidebar
  const sidebarStyle = {
    width: '240px',
    height: '100%',
    background: 'linear-gradient(135deg, #2c3e50, #34495e)',
    color: '#ecf0f1',
    padding: '20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  };

  const sidebarHeaderStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  };

  const sidebarItemStyle = {
    marginBottom: '1rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  };

  // Main content
  const mainContentStyle = {
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#ecf0f1',
    padding: '20px',
    boxSizing: 'border-box',
  };

  const headingStyle = {
    textAlign: 'center',
    fontSize: '1.8rem',
    marginBottom: '1.5rem',
    color: '#2c3e50',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  };

  const theadStyle = {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
  };

  const thStyle = { padding: '12px 10px', textAlign: 'left' };
  const tdStyle = { borderBottom: '1px solid #ddd', padding: '12px 10px' };

  const buttonStyle = {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#e74c3c' };

  return (
    <div style={containerStyle}>
      {/* Sidebar Navigation */}
      <div style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>Admin Panel</div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(0) }}
          onMouseEnter={() => handleMouseEnter(0)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/admin/dashboard')}
        >
          Dashboard
        </div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(1) }}
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/admin/users')}
        >
          Users
        </div>

        {/* Highlight “Trip Plans” */}
        <div
          style={{ 
            ...sidebarItemStyle,
            ...getSidebarItemDynamicStyle(2),
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
        >
          Trip Plans
        </div>

        <div
        style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(6) }}
        onMouseEnter={() => handleMouseEnter(6)}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate("/admin/notifications")}
        >
          Notifications
          </div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(3) }}
          onMouseEnter={() => handleMouseEnter(3)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/admin/reports')}
        >
          Reports
        </div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(4) }}
          onMouseEnter={() => handleMouseEnter(4)}
          onMouseLeave={handleMouseLeave}
        >
          Settings
        </div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(5) }}
          onMouseEnter={() => handleMouseEnter(5)}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            localStorage.removeItem('adminToken');
            navigate('/admin/login');
          }}
        >
          Logout
        </div>
      </div>

      {/* Main Content Area */}
      <div style={mainContentStyle}>
        <h2 style={headingStyle}>Trip Plans Management</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Trip Name</th>
              <th style={thStyle}>Trip Type</th>
              <th style={thStyle}>Destination</th>
              <th style={thStyle}>Meetup</th>
              <th style={thStyle}>Start Date</th>
              <th style={thStyle}>End Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip._id}>
                <td style={tdStyle}>{trip.userName || 'Unknown'}</td>
                <td style={tdStyle}>{trip.tripName}</td>
                <td style={tdStyle}>{trip.tripType}</td>
                <td style={tdStyle}>{trip.destination}</td>
                <td style={tdStyle}>{trip.meetupLocation}</td>
                <td style={tdStyle}>{new Date(trip.startDate).toLocaleDateString()}</td>
                <td style={tdStyle}>{new Date(trip.endDate).toLocaleDateString()}</td>
                <td style={tdStyle}>{trip.status}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={buttonStyle} onClick={() => handleMarkCompleted(trip._id)}>
                      Mark Completed
                    </button>
                    <button style={deleteButtonStyle} onClick={() => handleDeleteTrip(trip._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTripPlans;
