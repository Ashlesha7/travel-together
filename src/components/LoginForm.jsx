// import React, { useState } from 'react';
// import axios from 'axios';

// function LoginForm({ switchToSignup }) {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!email || !password) {
//             alert('Please enter both email and password.');
//             return;
//         }

//         setLoading(true);

//         try {
//             console.log("Sending login request:", { email, password });

//             const response = await axios.post('http://localhost:5000/api/login', { email, password });

//             console.log("Login successful:", response.data);

//             // Store JWT token in localStorage
//             localStorage.setItem('token', response.data.token);
            
//             alert(response.data.message);
//             window.location.reload(); // Refresh page after login
//         } catch (error) {
//             console.error("Login failed:", error.response?.data);
//             alert(error.response?.data?.message || 'Login failed');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="form-container active">
//             <h2>Login</h2>
//             <form onSubmit={handleSubmit}>
//                 <label htmlFor="login-email">Email</label>
//                 <input
//                     type="email"
//                     id="login-email"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                 />

//                 <label htmlFor="login-password">Password</label>
//                 <input
//                     type="password"
//                     id="login-password"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                 />

//                 <button type="submit" className="bold-btn" disabled={loading}>
//                     {loading ? 'Logging in...' : 'Login'}
//                 </button>

//                 <p className="switch">
//                     Don't have an account?{" "}
//                     <button type="button" onClick={switchToSignup} className="link-button">
//                         Sign up
//                     </button>
//                 </p>
//             </form>
//         </div>
//     );
// }

// export default LoginForm;


// import React, { useState } from 'react';
// import axios from 'axios';

// function LoginForm({ switchToSignup }) {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!email || !password) {
//             alert('Please enter both email and password.');
//             return;
//         }

//         setLoading(true);

//         try {
//             console.log("📤 Sending login request:", { email, password });

//             const response = await axios.post('http://localhost:5000/api/login', { email, password });
            

//             console.log("✅ Login successful:", response.data);

//             // Store JWT token in localStorage
//             localStorage.setItem('token', response.data.token);

//             alert(response.data.message);

//             // Redirect user after login
//             window.location.href = "/dashboard"; // Change to your desired route
//         } catch (error) {
//             console.error("❌ Login failed:", error.response?.data);
            
//             // Show error message
//             alert(error.response?.data?.message || 'Login failed. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="form-container active">
//             <h2>Login</h2>
//             <form onSubmit={handleSubmit}>
//                 <label htmlFor="login-email">Email</label>
//                 <input
//                     type="email"
//                     id="login-email"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                 />

//                 <label htmlFor="login-password">Password</label>
//                 <input
//                     type="password"
//                     id="login-password"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                 />

//                 <button type="submit" className="bold-btn" disabled={loading}>
//                     {loading ? 'Logging in...' : 'Login'}
//                 </button>

//                 <p className="switch">
//                     Don't have an account?{" "}
//                     <button type="button" onClick={switchToSignup} className="link-button">
//                         Sign up
//                     </button>
//                 </p>
//             </form>
//         </div>
//     );
// }

// export default LoginForm;


import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // NEW: Import the GoogleLogin component


function LoginForm({ switchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      console.log("📤 Sending login request:", { email, password });
      const response = await axios.post('http://localhost:8080/api/login', { email, password });
      console.log("✅ Login successful:", response.data);

      // Store JWT token in localStorage
      localStorage.setItem('token', response.data.token);
      // Also store the user object (with id) in localStorage for later use
      localStorage.setItem('user', JSON.stringify(response.data.user));

      alert(response.data.message);

      // Redirect user after login
      window.location.href = "/dashboard"; // Change this to your desired route
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data);
      alert(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove the dummy token code and use the GoogleLogin component to get a real token
  const handleGoogleSuccess = async (credentialResponse) => {
    // The real token is obtained here from Google via the OAuth library
    const googleIdToken = credentialResponse.credential;
    try {
      console.log("Google token received:", googleIdToken);
      const response = await axios.post('http://localhost:8080/api/google-signin', { token: googleIdToken });
      console.log("✅ Google sign-in successful:", response.data);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      alert(response.data.message);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("❌ Google sign-in failed:", error.response?.data);
      alert(error.response?.data?.message || 'Google sign in failed.');
    }
  };

  // NEW: Handler for errors from the GoogleLogin component
  const handleGoogleError = () => {
    console.error("Google sign in was unsuccessful.");
    alert("Google sign in was unsuccessful. Please try again.");
  };

  return (
    <div className="form-container active">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          type="email"
          id="login-email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          type="password"
          id="login-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="bold-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="switch">
          Don't have an account?{" "}
          <button type="button" onClick={switchToSignup} className="link-button">
            Sign up
          </button>
        </p>

        {/* NEW: Forgot Password Link */}
        <p className="forgot-password">
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
        </p>

        {/* NEW: Google Sign-In Button using the GoogleLogin component */}
        <div className="google-auth-btn-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
