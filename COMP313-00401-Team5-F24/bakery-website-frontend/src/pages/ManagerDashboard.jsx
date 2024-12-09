import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Row, Col } from 'react-bootstrap';

const ManagerDashboard = () => {
  return (
    <Container className="mt-4">
      <h2 className="text-center">Manager Dashboard</h2>

      <Row className="mt-5">
        {/* Manage Products */}
        <Col md={3}>
          <Link to="/manage-products" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Manage Products" />
              <Card.Body>
                <Card.Title>Manage Products</Card.Title>
                <Card.Text>
                  View, add, update, and delete products.
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Manage Staff */}
        <Col md={3}>
          <Link to="/manage-staff" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Manage Staff" />
              <Card.Body>
                <Card.Title>Manage Staff</Card.Title>
                <Card.Text>
                  View, add, update, and manage staff details.
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Manage Orders */}
        <Col md={3}>
          <Link to="/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Manage Orders" />
              <Card.Body>
                <Card.Title>Manage Orders</Card.Title>
                <Card.Text>
                  View, update, and manage customer orders.
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Create Report */}
        <Col md={3}>
          <Link to="/createreport" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="text-center">
              <Card.Img variant="top" src="https://via.placeholder.com/150" alt="Create Report" />
              <Card.Body>
                <Card.Title>Create Report</Card.Title>
                <Card.Text>
                  Navigate to create new reports for review.
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
