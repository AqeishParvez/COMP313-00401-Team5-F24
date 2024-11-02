import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { getUserInfo } from '../helpers/utils';
import PropTypes from 'prop-types';
import axios from 'axios';

const CustomNavbar = (kw) => {
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
    const handleStorageChange = (kw) => {
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

  const handelPostOrder = async () => {
    if (kw.cart && kw.cart.length > 0) {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/orders',
        { products: kw.cart },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the headers
          }
        }
      ).then( (res) => {
        console.log("confirmation: ", res.data._id); 
        alert(`Confirmation ID: ${res.data._id}`);

        kw.setCart([]);
      });
      console.log("Post Requested!");
      
    }
    else {
      console.log(" cart is empty");
      alert(`cart is empty`);

    }
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

          <button onClick={() => handelPostOrder()} className="btn btn-primary">Post Order</button>
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
