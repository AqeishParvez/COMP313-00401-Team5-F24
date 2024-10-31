import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { getUserInfo } from '../helpers/utils';

const CustomNavbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user info whenever the component mounts or localStorage changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);  // Set user info (name, role)
    };

    fetchUserInfo();

    // Add an event listener to localStorage changes to trigger re-render on login/logout
    const handleStorageChange = () => {
      fetchUserInfo();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);  // Reset user info
    navigate('/login');
  };

  const handleAccount = () => {
    console.log("Account Info");
    
    navigate('/account')
  }

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">Bakery Website</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/products">Products</Nav.Link>

          {user?.role === 'manager' && (
            <Nav.Link as={Link} to="/manager-dashboard">Manager Dashboard</Nav.Link>
          )}
        </Nav>

        <Nav>
          {user ? (
            <NavDropdown title={user.name} id="user-dropdown">
              <NavDropdown.Item onClick={handleAccount}>My Account</NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
