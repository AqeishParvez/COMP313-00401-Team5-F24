import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/ProductDetails';
import ManagerDashboard from './pages/ManagerDashboard';
import Navbar from './components/Navbar';
import EditOrder from './components/EditOrder';
import Cart from './components/Cart';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ManageStaff from './components/StaffManagement';
import ManageInventory from './components/ProductManagement';
import ManageOrders from './components/OrderManagement';


const App = () => {

  return (
    <div>
      <AuthProvider>
        <CartProvider>
          {/* Navbar will always be rendered */}
          <Navbar/>

          {/* Define your routes */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/products" element={<Products/>} />
            <Route path="/products/:id" element={<ProductDetails />} />

            <Route path="/manager-dashboard" element={
              <ProtectedRoute>
                <ManagerDashboard />
                </ProtectedRoute>
              } />

            <Route path="/manage-staff" element={
              <ProtectedRoute>
                <ManageStaff />
                </ProtectedRoute>
            } />

            <Route path="/manage-products" element={
              <ProtectedRoute>
                <ManageInventory />
              </ProtectedRoute>
            } />
            
            <Route path="/cart" element={<Cart />} />

            <Route path="/orders" element={<ManageOrders />} />
            <Route path="/orders/edit/:orderId" element={<EditOrder />} />
            
            <Route path="/" element={<Products />} />
            <Route path="/account" element={<Register mode={"edit-account"} />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
