import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      const token = response.data.token;

      // Save the token in localStorage or sessionStorage
      localStorage.setItem('token', token);

      // If logged in user is manager take them to manager dashboard
      if (response.data.role === 'manager') {
        navigate('/manager-dashboard');
        window.location.reload();
      } else if (response.data.role === 'staff') {
        // If logged in user is staff take them to staff dashboard
        navigate('/orders');
        window.location.reload();
      } else {
        // Redirect to products page
        navigate('/products');
        window.location.reload();
      }
    } catch (err) {
        alert(err);
      setError('Invalid login credentials');
    }
  };

  const handelResetPassword = () =>{
    navigate("/reset-password")
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
        <button onClick={handelResetPassword}>reset password</button>
      </form>
    </div>
  );
};

export default Login;