import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Row, Col, Container } from 'react-bootstrap';

const Products = (kw) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);


  const handelAddToCart = (product) =>{
    if (kw.addToCart){
      kw.addToCart(product);
    }
    else{
      console.log("login required!");
    }
  }

  return (
    <Container>
      <Row>
        {products.map((product) => (
          <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <Card>
              {/* Product image placeholder */}
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt={product.name} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>${product.price}</Card.Text>

                {/* Link to the product details page */}
                <Link to={`/products/${product._id}`} className="btn btn-primary">
                  View Details
                </Link>
                <button onClick={() => handelAddToCart({product:product._id, quantity:1})} className="btn btn-primary">Add To Cart</button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Products;
