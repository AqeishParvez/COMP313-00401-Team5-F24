import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/ProductDetails';
import ManagerDashboard from './pages/ManagerDashboard';
import Navbar from './components/Navbar';
const App = () => {
  return (
    <div>
      {/* Navbar will always be rendered */}
      <Navbar />

      {/* Define your routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/manager-dashboard" element={<ProtectedRoute element={ManagerDashboard} />} />
        <Route path="/" element={<Products />} />
      </Routes>
    </div>
  );
};

export default App;
