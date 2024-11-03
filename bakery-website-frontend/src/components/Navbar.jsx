import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { getUserInfo } from '../helpers/utils';
import { useCart } from '../contexts/CartContext';


const CustomNavbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { setCart, fetchCart } = useCart();

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
    setCart([]);  // Clear cart upon logout (using setCart function from CartContext)
    navigate('/login');
  };

  const handleAccount = () => {
    console.log("Account Info");

    navigate('/account')
  }

  const handleCartClick = async () => {
    await fetchCart(); // Fetch cart before navigating to /cart
    navigate('/cart');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">Bakery Website</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/products">Products</Nav.Link>
          {user? (
            <>
              <Nav.Link onClick={handleCartClick}>Cart</Nav.Link>
              <Nav.Link as={Link} to="/orders">Orders</Nav.Link>
            </>
          ) : null }

          {user?.role === 'manager' && (
            <>
              <Nav.Link as={Link} to="/manager-dashboard">Manager Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/orders">Manage Orders</Nav.Link>
              <Nav.Link as={Link} to="/manage-staff">Manage Staff</Nav.Link>
              <Nav.Link as={Link} to="/manage-inventory">Manage Products</Nav.Link>
            </>
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
