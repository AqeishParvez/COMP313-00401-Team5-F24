import axios from 'axios';

export const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');  // Debugging output
      return null;
    }

    const response = await axios.get('http://localhost:5001/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('User Info:', response.data);  // Debugging output
    return response.data;  // Return user info
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};
