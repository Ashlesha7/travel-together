
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // For hover effects on sidebar items
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        // Ensure you're hitting your Node server (port 8080)
        const res = await axios.get('http://localhost:8080/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users.');
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
    }
  };

  //  open modal with selected user details
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Hover styling for sidebar
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

  const mainContentStyle = {
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#ecf0f1',
    padding: '20px',
    boxSizing: 'border-box',
  };

  const headingStyle = {
    marginBottom: '1.5rem',
    color: '#2c3e50',
    textAlign: 'center',
    fontSize: '1.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
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

  const thStyle = {
    padding: '12px 10px',
    textAlign: 'left',
  };

  const tdStyle = {
    borderBottom: '1px solid #ddd',
    padding: '12px 10px',
  };

  const actionButtonStyle = {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const deleteButtonStyle = {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
  };

  const backButtonStyle = {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

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

        {/* Highlight “Users” */}
        <div
          style={{ 
            ...sidebarItemStyle, 
            ...getSidebarItemDynamicStyle(1), 
            backgroundColor: 'rgba(255, 255, 255, 0.1)' 
          }}
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
        onClick={() => navigate("/admin/notifications")}
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
        >
          Settings
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
        <h2 style={headingStyle}>User Management</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Joined</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((usr) => (
              <tr key={usr._id}>
                <td style={tdStyle}>{usr.fullName}</td>
                <td style={tdStyle}>{usr.email}</td>
                <td style={tdStyle}>{usr.phoneNumber}</td>
                <td style={tdStyle}>{new Date(usr.createdAt).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={actionButtonStyle} onClick={() => handleViewDetails(usr)}>
                      View Details
                    </button>
                    <button style={deleteButtonStyle} onClick={() => handleDelete(usr._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button style={backButtonStyle} onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {/* Modal for Extended User Details */}
      {showModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            position: 'relative'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#2c3e50' }}>
              User Details
            </h2>
            <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
            <p><strong>Citizenship Number:</strong> {selectedUser.citizenshipNumber || 'N/A'}</p>
            {selectedUser.citizenshipPhoto && (
              <div>
                <p><strong>Citizenship Photo:</strong></p>
                <img
                  src={`http://localhost:8080/${selectedUser.citizenshipPhoto}`}
                  alt="Citizenship"
                  style={{ width: '100px', height: 'auto', borderRadius: '4px' }}
                />
              </div>
            )}
            {selectedUser.birthYear && (
              <p><strong>Birth Year:</strong> {selectedUser.birthYear}</p>
            )}
            {selectedUser.gender && (
              <p><strong>Gender:</strong> {selectedUser.gender}</p>
            )}
            {selectedUser.bio && (
              <p><strong>Bio:</strong> {selectedUser.bio}</p>
            )}
            {selectedUser.homeBase && (
              <p><strong>Home Base:</strong> {selectedUser.homeBase}</p>
            )}
            <button 
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
