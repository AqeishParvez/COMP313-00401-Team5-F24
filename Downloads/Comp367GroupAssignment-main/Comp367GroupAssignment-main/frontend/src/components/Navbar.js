import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="brand">Student Management</div>
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/add-student">Add Student</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
