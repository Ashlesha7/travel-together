import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function ForgotPassword() {
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter code & new password
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/forgot-password", { email });
      alert(response.data.msg);
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.msg || "Error sending reset code");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/reset-password", {
        email,
        resetCode,
        newPassword,
      });
      alert(response.data.msg);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.msg || "Error resetting password");
    }
  };

  return (
    <div className="form-container active">
      {step === 1 && (
        <form onSubmit={handleSendResetCode}>
          <h2>Forgot Password</h2>
          <label htmlFor="forgot-email">Enter your email</label>
          <input
            type="email"
            id="forgot-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Code</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <label htmlFor="reset-code">Reset Code</label>
          <input
            type="text"
            id="reset-code"
            placeholder="Enter the reset code"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
          />
          <label htmlFor="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
}
