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

// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import { GoogleOAuthProvider } from '@react-oauth/google'; // NEW: Import Google OAuth Provider
// import HomePage from './components/HomePage';
// import LoginForm from './components/LoginForm';
// import SignupForm from './components/SignupForm';
// import Profile from './components/Profile';
// import StartTrip from "./components/StartTrip";
// import Discover from "./components/Discover";
// import MessagingPage from "./components/MessagingPage";
// import ForgotPassword from "./components/ForgotPassword"; // NEW: Forgot Password component
// import './App.css';
// import 'leaflet/dist/leaflet.css';
// import AdminLogin from './components/admin/AdminLogin';
// import AdminUsers from './components/admin/AdminUsers';
// import AdminDashboard from './components/admin/AdminDashboard';
// import AdminTripPlans from './components/admin/AdminTripPlans';
// import AdminReports from './components/admin/AdminReports';

// import withProfileCompletionCheck from "./withProfileCompletionCheck";
// const ProtectedStartTrip = withProfileCompletionCheck(StartTrip);
// const ProtectedDiscover = withProfileCompletionCheck(Discover);
// const ProtectedMessagingPage = withProfileCompletionCheck(MessagingPage);


// function App() {
//   const [isLoginActive, setIsLoginActive] = useState(true);
//   const [user, setUser] = useState(null);

//   // Simple check to see if an admin token exists
//   const isAdminAuthenticated = !!localStorage.getItem('adminToken');

//   // On mount, retrieve user from localStorage (if available)
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser)); // user object with { id, fullName, email, ... }
//     }
//   }, []);

//   const switchToSignup = () => setIsLoginActive(false);
//   const switchToLogin = () => setIsLoginActive(true);

//   return (
//     // NEW: Wrap your app inside the GoogleOAuthProvider
//     <GoogleOAuthProvider clientId="769192409997-3kh4bsfskdr19o86c01hpsf4tqdfor82.apps.googleusercontent.com">
//       <Router>
//         <Routes>
//           {/* Default route - Home Page */}
//           <Route path="/" element={<HomePage />} />

//           {/* Login and Signup Routes */}
//           <Route
//             path="/login"
//             element={
//               isLoginActive ? (
//                 <LoginForm switchToSignup={switchToSignup} />
//               ) : (
//                 <Navigate to="/signup" />
//               )
//             }
//           />
//           <Route
//             path="/signup"
//             element={
//               !isLoginActive ? (
//                 <SignupForm switchToLogin={switchToLogin} />
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />

//           {/* Forgot Password Route */}
//           <Route path="/forgot-password" element={<ForgotPassword />} />

//           {/* Profile Route */}
//           <Route path="/profile" element={<Profile />} />

//           {/* Start Trip Route */}
//           <Route path="/start-trip" element={<StartTrip />} />

//           {/* Discover Route */}
//           <Route path="/discover" element={<Discover />} />

//           {/* Messaging Page Routes */}
//           {/* When no conversationId is provided */}
//           <Route path="/messages" element={<MessagingPage user={user} />} />
//           {/* When a conversationId is provided */}
//           <Route path="/messages/:conversationId" element={<MessagingPage user={user} />} />

//           {/* Admin Routes */}
//           <Route path="/admin/login" element={<AdminLogin />} />
//           <Route 
//             path="/admin/dashboard" 
//             element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
//           />
//           <Route path="/admin/users" element={<AdminUsers />} />
//           <Route path="/admin/trip-plans" element={<AdminTripPlans />} />
//           <Route path="/admin/reports" element={<AdminReports />} />

//           {/* Redirect any unknown routes to Home Page */}
//           <Route path="*" element={<Navigate to="/" />} />

//           <Route path="/start-trip" element={<ProtectedStartTrip />} />
//           <Route path="/discover" element={<ProtectedDiscover />} />
//           <Route path="/messages" element={<ProtectedMessagingPage />} />
//         </Routes>
//       </Router>
//     </GoogleOAuthProvider>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'; // NEW: Import Google OAuth Provider
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
import AdminTripPlans from './components/admin/AdminTripPlans';
import AdminReports from './components/admin/AdminReports';
import withProfileCompletionCheck from "./withProfileCompletionCheck";

const ProtectedStartTrip = withProfileCompletionCheck(StartTrip);
const ProtectedDiscover = withProfileCompletionCheck(Discover);
const ProtectedMessagingPage = withProfileCompletionCheck(MessagingPage);

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
    // Wrap your app inside the GoogleOAuthProvider
    <GoogleOAuthProvider clientId="769192409997-3kh4bsfskdr19o86c01hpsf4tqdfor82.apps.googleusercontent.com">
      <Router>
        <Routes>
          {/* Default route - Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Login and Signup Routes */}
          <Route 
            path="/login" 
            element={isLoginActive ? <LoginForm switchToSignup={switchToSignup} /> : <Navigate to="/signup" />}
          />
          <Route 
            path="/signup" 
            element={!isLoginActive ? <SignupForm switchToLogin={switchToLogin} /> : <Navigate to="/login" />}
          />

          {/* Forgot Password Route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Profile Route */}
          <Route path="/profile" element={<Profile />} />

          {/* Protected Routes using the HOC */}
          <Route path="/start-trip" element={<ProtectedStartTrip />} />
          <Route path="/discover" element={<ProtectedDiscover />} />
          <Route path="/messages" element={<ProtectedMessagingPage user={user} />} />
          <Route path="/messages/:conversationId" element={<ProtectedMessagingPage user={user} />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />}
          />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/trip-plans" element={<AdminTripPlans />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          {/* Redirect any unknown routes to Home Page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
