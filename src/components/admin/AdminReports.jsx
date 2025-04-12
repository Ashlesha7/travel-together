// src/components/admin/AdminReports.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

function AdminReports() {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  
  // For sidebar hover effect
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get('http://localhost:8080/api/admin/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportData(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to fetch reports.");
      }
    };
    fetchReports();
  }, []);

  // Sidebar hover logic
  const handleMouseEnter = (index) => setHoveredItem(index);
  const handleMouseLeave = () => setHoveredItem(null);
  const getSidebarItemDynamicStyle = (index) => {
    return hoveredItem === index
      ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
      : {};
  };

  // Layout styles (similar to AdminDashboard)
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

  // Sidebar: gradient background
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

  // Main content area for charts
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
    marginBottom: '20px',
    color: '#2c3e50',
    fontSize: '1.8rem',
  };

  if (!reportData) {
    return (
      <div style={containerStyle}>
        {/* Sidebar */}
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
            style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(2) }}
            onMouseEnter={() => handleMouseEnter(2)}
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

          {/* Highlight “Reports” */}
          <div
            style={{
              ...sidebarItemStyle,
              ...getSidebarItemDynamicStyle(3),
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={() => handleMouseEnter(3)}
            onMouseLeave={handleMouseLeave}
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

        {/* Main Content */}
        <div style={mainContentStyle}>
          <h2 style={headingStyle}>System Reports</h2>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
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
          style={{ ...sidebarItemStyle, ...getSidebarItemDynamicStyle(2) }}
          onMouseEnter={() => handleMouseEnter(2)}
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

        {/* Highlight “Reports” */}
        <div
          style={{
            ...sidebarItemStyle,
            ...getSidebarItemDynamicStyle(3),
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={() => handleMouseEnter(3)}
          onMouseLeave={handleMouseLeave}
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
        <h2 style={headingStyle}>System Reports</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ textAlign: 'center', color: '#2c3e50' }}>User Registrations per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={reportData.userRegistrations}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3498db" name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ textAlign: 'center', color: '#2c3e50' }}>Trip Plans per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={reportData.tripPlans}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#e74c3c" name="Trip Plans" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New: Status Distribution Chart */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ textAlign: 'center', color: '#2c3e50' }}>Trip Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={reportData.statusDistribution} // expected format: [{ status: 'planned', count: X }, { status: 'completed', count: Y }]
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#9b59b6" name="Status Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* New Section: Notifications Distribution */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ textAlign: 'center', color: '#2c3e50' }}>Notifications Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={reportData.notificationsDistribution}  // expected format: [{ status: "pending", count: X }, ...]
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#f1c40f" name="Notifications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
