import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Row, Col } from 'react-bootstrap';
import '../manager.css';



const ManagerDashboard = () => {
  return (
    <Container className="mt-4">
      <h2 className="text-center">Manager Dashboard</h2>

      <Row className="mt-5">
        <Col md={4}>
          <Link to="/manage-products" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src={`../src/assets/products.svg`} alt="Manage Products" />
              <Card.Body>
                <Card.Title>Manage Products</Card.Title>
                <Card.Text>
                  View, add, update, and delete products.
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/manage-staff" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src={`../src/assets/employees.svg`} alt="Manage Staff" />
              <Card.Body>
                <Card.Title>Manage Staff</Card.Title>
                <Card.Text>
                  View, add, update, and manage staff details.
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src={`../src/assets/orders.svg`} alt="Manage Orders" />
              <Card.Body>
                <Card.Title>Manage Orders</Card.Title>
                <Card.Text>
                  View, update, and manage customer orders.
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>


        <Col md={4}>
          <Link to="/manage-customers" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src={`../src/assets/customers.svg`} alt="Manage Orders" />
              <Card.Body>
                <Card.Title>Clientele.</Card.Title>
                <Card.Text>
                   
                  View Customer Details
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default ManagerDashboard;