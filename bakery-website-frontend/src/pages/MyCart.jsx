import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '../helpers/utils.js';

const MyCart = ({ cart }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // Default role to customer
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [edit, setEdit] = useState(false);

    useEffect(() => {

        if (kw.mode == "edit-account") {
            setEdit(true);
            (async () => {
                const userInfo = await getUserInfo();
                console.log(userInfo);

                setName(userInfo.name)
                setEmail(userInfo.email)
                setRole(userInfo.role)

            })();

        }


    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (edit) {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/auth/update', { name, email, password, role },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }
        else {
            try {
                await axios.post('http://localhost:5001/api/auth/register', { name, email, password, role });
                // Redirect to login page after successful registration
                navigate('/login');
            } catch (err) {
                setError('Error registering user');
            }
        }
    };

    const handleCancel = () => {
        navigate("/")
    }

    return (
        <div>
            <h2>{edit ? "Update" : "Register"}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {!edit ? <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div> : ""}
                {!edit ? <div>
                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                    </select>
                </div> : ""}
                {edit ? <button onClick={handleCancel}>Cancel</button> : ""}
                <button type="submit">{edit ? "Update" : "Register"}</button>
            </form>
        </div>
    );
};

export default MyCart;