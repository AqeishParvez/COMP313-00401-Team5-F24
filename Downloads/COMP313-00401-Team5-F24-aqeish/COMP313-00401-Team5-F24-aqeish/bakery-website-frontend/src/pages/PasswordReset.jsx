import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';


const ResetPassword = () => {
    const { token } = useParams();
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/auth/verify-reset-token/${token}`);
                if (response.data.valid) setIsTokenValid(true) //In case the server didn't error for whatever reason
            } catch (err) {
                console.error('Token verification failed');
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    async function handleSubmit(event) {
        event.preventDefault();
        const password = event.target.password.value;
        try {
            const response = await axios.put('http://localhost:5001/api/auth/reset-password', { token, password });
            if (response.data.success) {
                setMsg('Password reset successful!\nYou will be redirect shortly')
                setTimeout(() => navigate('/Login'), 3000);
            } else {
                setMsg('Password reset failed\nPlease try again with another combination')
                setTimeout(() => setMsg(''), 5000);
            }
        } catch (err) {
            setMsg('An unexpected error occurred.\nPlease try again with another combination')
            setTimeout(() => setMsg(''), 5000);
        }
    }

    if (loading) return <div>Loading...</div>;

    if (!isTokenValid) return <div>Invalid or expired token</div>;
    
    return (
    <form onSubmit={handleSubmit}>
        {msg && <p style={{ color: 'red' }}>{msg}</p>}
        <label>
        New Password:
        <input type="password" name="password" required />
        </label>
        <button type="submit">Reset Password</button>
    </form>
    );
};

export default ResetPassword;