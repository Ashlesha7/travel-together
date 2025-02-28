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


import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Profile from './components/Profile';  // <--- Import Profile
import './App.css';
import StartTrip from "./components/StartTrip";
import 'leaflet/dist/leaflet.css';
import Discover from "./components/Discover";


function App() {
    const [isLoginActive, setIsLoginActive] = useState(true);

    const switchToSignup = () => setIsLoginActive(false);
    const switchToLogin = () => setIsLoginActive(true);

    return (
        <Router>
            <Routes>
                {/* ✅ Default route - Home Page */}
                <Route path="/" element={<HomePage />} />

                {/* ✅ Login and Signup Routes */}
                <Route 
                    path="/login" 
                    element={isLoginActive ? <LoginForm switchToSignup={switchToSignup} /> : <Navigate to="/signup" />}
                />
                <Route 
                    path="/signup" 
                    element={!isLoginActive ? <SignupForm switchToLogin={switchToLogin} /> : <Navigate to="/login" />}
                />

                {/* ✅ New Profile Route */}
                <Route path="/profile" element={<Profile />} />

                {/* ✅ Redirect any unknown routes to Home Page */}
                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/start-trip" element={<StartTrip />} />
                <Route path="/discover" element={<Discover />} />

            </Routes>
        </Router>
    );
}

export default App;
