import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products');
        setProducts(response.data);
        console.log(response.data);
      } catch (err) {
        setError('Error fetching products');
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Product Listings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="product-list">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>{product.availability ? 'Available' : 'Out of Stock'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
