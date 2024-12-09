import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button, FormControl} from 'react-bootstrap';
import { getUserInfo } from '../helpers/utils';
import { useCart } from '../contexts/CartContext';


const CustomNavbar = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { setCart, fetchCart, itemCount } = useCart();

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

  // Fetch cart and item count whenever there are any changes to cart or user
  useEffect(() => {
    const refreshCart = async () => {
      await fetchCart();
  };

    refreshCart();
  }, [user]);

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

  // Search function
  const handleSearch = (event) => {
    event.preventDefault();
    console.log('Searching for:', searchQuery);
    navigate(`/search?query=${searchQuery}`);
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">Bakery Website</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/products">Products</Nav.Link>
          {user? (
            <>
              <Nav.Link as={Link} to="/orders">Manage Orders</Nav.Link>
            </>
          ) : null }

          {user?.role === 'manager' && (
            <>
              <Nav.Link as={Link} to="/manage-staff">Manage Staff</Nav.Link>
              <Nav.Link as={Link} to="/manage-products">Manage Products</Nav.Link>
              <Nav.Link as={Link} to="/manager-dashboard">Manager Dashboard</Nav.Link>
            </>
          )}

          {
            user && user.role === 'staff' && (
              <>
              <Nav.Link as={Link} to="/manage-products">Manage Products</Nav.Link>
              <Nav.Link as={Link} to="/staff-dashboard">Staff Dashboard</Nav.Link>
              </>
            )
          }

          {user && (user.role === 'manager' || user.role === 'staff') && (
            <>
            <Nav.Link as={Link} to="/send-notifications">Send Notifications</Nav.Link>
            <Nav.Link as={Link} to="/staff-reports">Order Reports</Nav.Link>
            </>
          )}
          
          {user && user.role === 'customer' && (
            <Nav.Link onClick={handleCartClick} style={itemCount!=0 ? {fontWeight: 'bold', color: '#007bff', border: '2px solid #007bff', borderRadius: '5px', padding: '5px 10px', background: '#e3f2fd'} : {fontWeight: 'normal', color: '#cccccc'}}>Cart {(itemCount? `(x${itemCount})` : `(Empty)`)} </Nav.Link>
          )}

        </Nav>

        {user? (
            <>
              <Nav.Link as={Link} to="/notifications">Notifications</Nav.Link>
            </>
          ) : null }

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
        <form className="d-flex ms-auto" onSubmit={handleSearch}>
          <FormControl
            type="search"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="me-2"
            aria-label="Search"
          />
          <Button variant="outline-success" type="submit">Search</Button>
        </form>
        
      </Navbar.Collapse>
    </Navbar>
  );
};



export default CustomNavbar;
