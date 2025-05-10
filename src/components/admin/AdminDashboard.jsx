
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Track which sidebar item is hovered
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:8080/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      }
    };

    fetchDashboardData();
  }, []);

  // Root container
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

  // Base style for each sidebar item
  const sidebarItemStyle = {
    marginBottom: '1rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  };

  
  const getSidebarItemDynamicStyle = (index) => {
    return hoveredItem === index
      ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
      : {};
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

  const headerStyle = {
    marginBottom: '1.5rem',
    color: '#2c3e50',
  };

  //  layout for dashboard widgets
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    boxSizing: 'border-box',
  };

  const handleMouseEnter = (index) => setHoveredItem(index);
  const handleMouseLeave = () => setHoveredItem(null);

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

        <div
        style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(5) }}
        onMouseEnter={() => handleMouseEnter(5)}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate('/admin/trip-plans')}
        >
          Trip Plans
          </div>

          <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(6) }}
          onMouseEnter={() => handleMouseEnter(6)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/admin/notifications')}
          >
            Notifications
            </div>



        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(2) }}
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate('/admin/reports')}
        >
          Reports
        </div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(3) }}
          onMouseEnter={() => handleMouseEnter(3)}
          onMouseLeave={handleMouseLeave}
          onClick={() => navigate("/admin/reviews")}
        >
          Ratings and Reviews
        </div>

        <div
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(4) }}
          onMouseEnter={() => handleMouseEnter(4)}
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
        <h2 style={headerStyle}>Admin Dashboard</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {dashboardData ? (
          <div style={gridStyle}>
            <div style={cardStyle}>
              <h3>Total Users</h3>
              <p style={{ fontSize: '1.5rem' }}>{dashboardData.totalUsers || 0}</p>
            </div>
            <div style={cardStyle}>
              <h3>Total Trips</h3>
              <p style={{ fontSize: '1.5rem' }}>{dashboardData.totalTrips || 0}</p>
            </div>
            <div style={cardStyle}>
              <h3>Recent Signups</h3>
              <ul style={{ paddingLeft: '20px' }}>
                {dashboardData.recentSignups && dashboardData.recentSignups.length > 0 ? (
                  dashboardData.recentSignups.map((user, index) => (
                    <li key={index}>{user}</li>
                  ))
                ) : (
                  <li>No recent signups</li>
                )}
              </ul>
            </div>
            
          </div>
        ) : (
          <p>Loading dashboard data...</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
