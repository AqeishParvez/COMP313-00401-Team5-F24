import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available products from the backend API
   const fetchProducts = async () => {
      try {
   const response = await axios.get('/api/products');  // Replace with actual API endpoint
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update selected products list and calculate the total price
  const handleProductChange = (productId, quantity) => {
    const updatedProducts = selectedProducts.filter(item => item.product !== productId);
    if (quantity > 0) {
      updatedProducts.push({ product: productId, quantity });
    }
    setSelectedProducts(updatedProducts);

    // Calculate the total price based on selected products and quantities
    const total = updatedProducts.reduce((sum, item) => {
      const product = products.find(prod => prod._id === item.product);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    setTotalPrice(total);
  };

  // Handle order submission
  const handlePlaceOrder = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    try {
      const response = await axios.post('/api/orders', {
        products: selectedProducts,
        totalPrice
      });
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div>
      <h2>Place Your Order</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div>
          {products.map(product => (
            <div key={product._id}>
              <label>
                {product.name} - ${product.price.toFixed(2)}
                <input
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  onChange={(e) => handleProductChange(product._id, parseInt(e.target.value))}
                />
              </label>
            </div>
          ))}
          <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
