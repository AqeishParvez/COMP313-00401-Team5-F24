import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        { email, password }
      );
      console.log(response.data);
      const token = response.data.token;

      localStorage.setItem("token", token);

      if (response.data.role === "manager") {
        navigate("/manager-dashboard");
        window.location.reload();
      } else if (response.data.role === "staff") {
        navigate("/orders");
        window.location.reload();
      } else {
        navigate("/products");
        window.location.reload();
      }
    } catch (err) {
      setError("Invalid login credentials");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.patch("http://localhost:5001/api/auth/update-password", {
        email,
        newPassword,
      });
      alert(
        "Password updated successfully. You can now log in with your new password."
      );
      setIsForgotPassword(false);
    } catch (err) {
      console.error("Error updating password:", err);
      setError(
        "Error updating password. Please check the email and try again."
      );
    }
  };

  return (
    <div className="loginpage">
      <h2>{isForgotPassword ? "Forgot Password" : "Login"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {isForgotPassword ? (
        <form onSubmit={handleForgotPassword}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Update Password</button>
          <button type="button" onClick={() => setIsForgotPassword(false)}>
            Back to Login
          </button>
        </form>
      ) : (
        // Login Form
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      )}

      {!isForgotPassword && (
        <p>
          <button type="button" onClick={() => setIsForgotPassword(true)}>
            Forgot Password?
          </button>
        </p>
      )}
    </div>
  );
};

export default Login;
