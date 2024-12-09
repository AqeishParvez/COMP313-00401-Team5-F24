import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/ProductDetails';
import ManagerDashboard from './pages/ManagerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import SendNotifications from './components/SendNotifications';
import Navbar from './components/Navbar';
import OrderDetails from './pages/OrderDetails';
import EditOrder from './components/EditOrder';
import Cart from './components/Cart';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ManageStaff from './components/StaffManagement';
import ManageInventory from './components/ProductManagement';
import ManageOrders from './components/OrderManagement';
import Notifications from './components/Notifications';
import Profile from './pages/Profile';
import PasswordReset from './pages/PasswordReset';
import StaffReports from './components/StaffReports';

const App = () => {
  return (
    <div>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            {/* Manager-only routes */}
            <Route path="/manager-dashboard" element={
              <ProtectedRoute requiredRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/manage-staff" element={
              <ProtectedRoute requiredRoles={['manager']}>
                <ManageStaff />
              </ProtectedRoute>
            } />
            <Route path="/manage-products" element={
              <ProtectedRoute requiredRoles={['manager']}>
                <ManageInventory />
              </ProtectedRoute>
            } />

            {/* Staff and Manager shared routes */}
            <Route path="/staff-dashboard" element={
              <ProtectedRoute requiredRoles={['manager', 'staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />
            <Route path="/send-notifications" element={
              <ProtectedRoute requiredRoles={['manager', 'staff']}>
                <SendNotifications />
              </ProtectedRoute>
            } />
            <Route path="/staff-reports" element={
              <ProtectedRoute requiredRoles={['manager', 'staff']}>
                <StaffReports />
              </ProtectedRoute>
            } />

            {/* Shared routes */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<ManageOrders />} />
            <Route path="/orders/details/:id" element={<OrderDetails />} />
            <Route path="/orders/edit/:orderId" element={<EditOrder />} />
            <Route path="/search" element={<Products />} />
            <Route path="/" element={<Products />} />
            <Route path="/account" element={<Profile />} />
            <Route path="/reset/:token" element={<PasswordReset />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
