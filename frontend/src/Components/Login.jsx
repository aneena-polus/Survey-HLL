import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onLogin } from '../services/loginService.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

function Login() {
    const [loginError, setLoginError] = useState('');
    const { userData, setUserData } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        setUserData({ username: '', password: '' });
    }, [setUserData]);


    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setUserData((prevState) => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin(userData).then((response) => {
            localStorage.setItem('userData', JSON.stringify(response.data.userData));
            setUserData(response.data.userData);
            navigate('/surveylist');
        })
            .catch((error) => {
                console.error("Error during login:", error);
                setLoginError(error.response.data);
            });
    };

    return (
        <>
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="card shadow-sm p-4 w-100" style={{maxWidth: '400px'}}>
                    <h2 className="text-center mb-4">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input type="text" id="username" className="form-control" onChange={handleInputChange} placeholder="Enter username" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" id="password" className="form-control" onChange={handleInputChange} placeholder="Enter password" required />
                            {loginError && <div className="text-danger mt-2">{loginError}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Login</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
