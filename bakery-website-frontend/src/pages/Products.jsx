import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Row, Col, Container, Button } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

  return (
    <Container>
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
    </Container>
  );
};

export default Products;
