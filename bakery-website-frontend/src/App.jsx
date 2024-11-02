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
import MyCart from './pages/MyCart';
const App = () => {
  const [cart, setCart] = useState([]);
  const addToCart = (product) => {
    // product: {id, quantity=1} != null
    // cart: product[] = useState.cart
    const _product= cart.find(p => p.product == product.product);
    if(_product){
      _product.quantity += product.quantity;
      console.log(`product ${_product.product} quantity increased to ${_product.quantity} item(s).`);
    }
    else{
      setCart([...cart, product]);
      console.log(`product ${product.product} of quantity ${product.quantity} item(s) added to cart.`);
    }
  }
  return (
    <div>
      {/* Navbar will always be rendered */}
      <Navbar cart={cart} setCart={setCart} />

      {/* Define your routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products addToCart={addToCart} />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/manager-dashboard" element={<ProtectedRoute element={ManagerDashboard} />} />
        <Route path="/" element={<Products />} />
        <Route path="/account" element={<Register mode={"edit-account"} />} />
        <Route path="/cart" element={<MyCart cart={cart} setCart={setCart} />} />
      </Routes>
    </div>
  );
};

export default App;
