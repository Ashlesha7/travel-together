// import React, { useState } from 'react';
// import LoginForm from './components/LoginForm';
// import SignupForm from './components/SignupForm';
// import './App.css';

// function App() {
//     const [isLoginActive, setIsLoginActive] = useState(true);

//     const switchToSignup = () => setIsLoginActive(false);
//     const switchToLogin = () => setIsLoginActive(true);

//     return (
//         <div className="container">
//             {isLoginActive ? (
//                 <LoginForm switchToSignup={switchToSignup} />
//             ) : (
//                 <SignupForm switchToLogin={switchToLogin} />
//             )}
//         </div>
//     );
// }

// export default App;


// import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import HomePage from './components/HomePage';
// import LoginForm from './components/LoginForm';
// import SignupForm from './components/SignupForm';
// import Profile from './components/Profile'; 
// import './App.css';

// function App() {
//     const [isLoginActive, setIsLoginActive] = useState(true);

//     const switchToSignup = () => setIsLoginActive(false);
//     const switchToLogin = () => setIsLoginActive(true);

//     return (
//         <Router>
//             <Routes>
//                 {/* ✅ Default route - Home Page */}
//                 <Route path="/" element={<HomePage />} />

//                 {/* ✅ Login and Signup Routes */}
//                 <Route 
//                     path="/login" 
//                     element={isLoginActive ? <LoginForm switchToSignup={switchToSignup} /> : <Navigate to="/signup" />}
//                 />
//                 <Route 
//                     path="/signup" 
//                     element={!isLoginActive ? <SignupForm switchToLogin={switchToLogin} /> : <Navigate to="/login" />}
//                 />

//                 {/* ✅ Redirect any unknown routes to Home Page */}
//                 <Route path="*" element={<Navigate to="/" />} />
//             </Routes>
//         </Router>
//     );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Profile from './components/Profile';
import StartTrip from "./components/StartTrip";
import Discover from "./components/Discover";
import MessagingPage from "./components/MessagingPage";
import ForgotPassword from "./components/ForgotPassword"; // NEW: Forgot Password component
import './App.css';
import 'leaflet/dist/leaflet.css';
import AdminLogin from './components/admin/AdminLogin';
import AdminUsers from './components/admin/AdminUsers';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [user, setUser] = useState(null);

  // Simple check to see if an admin token exists
  const isAdminAuthenticated = !!localStorage.getItem('adminToken');

  // On mount, retrieve user from localStorage (if available)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // user object with { id, fullName, email, ... }
    }
  }, []);

  const switchToSignup = () => setIsLoginActive(false);
  const switchToLogin = () => setIsLoginActive(true);

  return (
    <Router>
      <Routes>
        {/* Default route - Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Login and Signup Routes */}
        <Route
          path="/login"
          element={
            isLoginActive ? (
              <LoginForm switchToSignup={switchToSignup} />
            ) : (
              <Navigate to="/signup" />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isLoginActive ? (
              <SignupForm switchToLogin={switchToLogin} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Forgot Password Route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Profile Route */}
        <Route path="/profile" element={<Profile />} />

        {/* Start Trip Route */}
        <Route path="/start-trip" element={<StartTrip />} />

        {/* Discover Route */}
        <Route path="/discover" element={<Discover />} />

        {/* Messaging Page Routes */}
        {/* When no conversationId is provided */}
        <Route path="/messages" element={<MessagingPage user={user} />} />
        {/* When a conversationId is provided */}
        <Route path="/messages/:conversationId" element={<MessagingPage user={user} />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
        />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Redirect any unknown routes to Home Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
