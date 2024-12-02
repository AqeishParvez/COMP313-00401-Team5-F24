import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card, Row, Col, Container, Button, Form } from "react-bootstrap";
import { useCart } from "../contexts/CartContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availability, setAvailability] = useState("");
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    try {
      const queryParams = {};
      if (searchTerm) queryParams.name = searchTerm;
      if (availability) queryParams.availability = availability;

      // Convert queryParams to query string
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await axios.get(
        `http://localhost:5001/api/products/search?${queryString}`
      );

      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, availability]);

  return (
    <Container>
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group controlId="search">
     
            <Form.Control
              type="text"
              placeholder="Search Product by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="availability">
            <Form.Label>Filter by Availability</Form.Label>
            <Form.Control
              as="select"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        {products.map((product) => (


          <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={`../src/assets/${product.name}.jpg`}
                alt={product.name}
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>${product.price}</Card.Text>

                <Button variant="primary" onClick={() => addToCart(product, 1)}>
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
