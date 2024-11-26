import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../helpers/utils.js";

const Register = (props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [staffRole, setStaffRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (props.mode === "edit-account") {
      setEdit(true);
      (async () => {
        const userInfo = await getUserInfo();
        setName(userInfo.name);
        setEmail(userInfo.email);
        setRole(userInfo.role);
        setUserId(userInfo.id);
      })();
    }
  }, [props.mode]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (edit) {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:5001/api/auth/update",
          { name, email, password, role, staffRole },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:5001/api/auth/register", {
          name,
          email,
          password,
          role,
          staffRole,
        });
        navigate("/login");
      }
    } catch (err) {
      setError("Error registering or updating user");
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5001/api/auth/customers/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Account deleted successfully.");
        localStorage.removeItem("token");
        navigate("/login");
      } catch (err) {
        setError("Error deleting account");
      }
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="loginpage">
      <h2>{edit ? "Update" : "Register"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {!edit && (
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}
        {!edit && (
          <div>
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        )}
        {/* Show staff role dropdown only if role is set to "staff" */}
        {role === "staff" && !edit && (
          <div>
            <label>Staff Role</label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value)}
              required
            >
              <option value="">Select Staff Role</option>
              <option value="baker">Baker</option>
              <option value="front desk">Front Desk</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>
        )}
        {edit && <button onClick={handleCancel}>Cancel</button>}
        <button type="submit">{edit ? "Update" : "Register"}</button>
        {edit && (
          <button
            type="button"
            onClick={handleDeleteAccount}
            style={{ color: "red", marginLeft: "10px" }}
          >
            Delete Account
          </button>
        )}
      </form>
    </div>
  );
};

export default Register;
