import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { getUserInfo } from '../helpers/utils';
import { useCart } from '../contexts/CartContext';

const CustomNavbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { setCart, fetchCart, itemCount } = useCart();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        setUser(userInfo);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();

    const handleStorageChange = (event) => {
      if (event.key === 'token') fetchUserInfo();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const refreshCart = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    refreshCart();
  }, [user]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      setUser(null);
      setCart([]);
      navigate('/login');
    }
  };

  const handleCartClick = async () => {
    await fetchCart();
    navigate('/cart');
  };

  const renderManagerLinks = () => (
    <>
      <Nav.Link as={Link} to="/manage-staff">Manage Staff</Nav.Link>
      <Nav.Link as={Link} to="/manage-products">Manage Products</Nav.Link>
      <Nav.Link as={Link} to="/manager-dashboard">Manager Dashboard</Nav.Link>
    </>
  );

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">Bakery Website</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/products">Products</Nav.Link>
          {user && <Nav.Link as={Link} to="/orders">Manage Orders</Nav.Link>}
          {user?.role === 'manager' && renderManagerLinks()}
          {user?.role === 'customer' && (
            <Nav.Link
              onClick={handleCartClick}
              style={
                itemCount
                  ? { fontWeight: 'bold', color: '#007bff', border: '2px solid #007bff', borderRadius: '5px', padding: '5px 10px', background: '#e3f2fd' }
                  : { fontWeight: 'normal', color: '#cccccc' }
              }
            >
              Cart {itemCount ? `(x${itemCount})` : `(Empty)`}
            </Nav.Link>
          )}
        </Nav>
        <Nav>
          {user ? (
            <NavDropdown title={user.name} id="user-dropdown">
              <NavDropdown.Item onClick={() => navigate('/account')}>My Account</NavDropdown.Item>
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