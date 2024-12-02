import React, { useEffect, useState } from 'react';
import { Link, useLocation  } from 'react-router-dom';
import axios from 'axios';
import { Card, Row, Col, Container, Button } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  // for homepage use
  const [newestProducts, setNewestProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const { addToCart } = useCart();

  // to get current page, probably not the best idea... but too lazt to open a new page
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
    if (location.pathname === '/') {
      fetchHighlightProducts();
    }
  }, []);

  const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

  const fetchHighlightProducts = async () => {
    try {
      const [newestResponse, popularResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/products/newest'),
        axios.get('http://localhost:5001/api/products/popular'),
      ]);
      setNewestProducts(newestResponse.data);
      setPopularProducts(popularResponse.data);
    } catch (error) {
      console.error('Error fetching highlight products:', error);
    }
  };

  const renderProductCards = (productList) => (
    <Row>
    {products.map((product) => (
      <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
        <Card>
          <Card.Img variant="top" src="https://via.placeholder.com/150" alt={product.name} />
          <Card.Body>
            <Card.Title>{product.name}</Card.Title>
            <Card.Text>${product.price}</Card.Text>
            {/* Show product availability or quantity. Show out of stock in red*/}
            <Card.Text>{product.quantity > 0 ? `In Stock: ${product.quantity}` : <span className='text-danger'>Out of Stock</span>}</Card.Text>

            <Button
              variant="primary"
              onClick={() => {
                // Add the product to cart if available
                if (product.quantity > 0) {
                  addToCart(product, 1);
                } else {
                  alert('Product is out of stock');
                }
              }}
            >
              Add to Cart
            </Button>
            <Button 
              variant="secondary"
              as={Link}
              to={`/products/${product._id}`}
            >
              View Details
            </Button>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
  );

  return (
    <Container>
      {location.pathname === '/' && (
        <>
          {/* Newest/Popular Products Section for*/}
          <h2>Our Newest Items</h2>
          {newestProducts.length > 0 ? renderProductCards(newestProducts) : <p>Loading newest products...</p>}

          <h2>Most Popular Items</h2>
          {popularProducts.length > 0 ? renderProductCards(popularProducts) : <p>Loading most popular products...</p>}
        </>
      )}

      {/* Products Section */}
      {products.length > 0 ? renderProductCards(products) : <p>Loading products...</p>}

    </Container>
  );
};

export default Products;
