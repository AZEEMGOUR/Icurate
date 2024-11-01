import React, { useState } from 'react';
import './LoginForm.css'; // Assuming you're using the same CSS

const LoginSignupForm = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const loginResponse = await fetch('http://127.0.0.1:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for session handling
                body: JSON.stringify({ username, password }),
            });

            const loginResult = await loginResponse.json();

            if (loginResponse.ok) {
                localStorage.setItem('authenticated', 'true');
                onLoginSuccess();
                await checkUserSession();
            } else {
                setError(loginResult.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Something went wrong. Please try again.');
        }
    };

    const checkUserSession = async () => {
        try {
            const sessionResponse = await fetch('http://127.0.0.1:5000/auth/check-session', {
                method: 'GET',
                credentials: 'include',
            });

            const sessionData = await sessionResponse.json();

            if (sessionResponse.ok && sessionData.status === 'authenticated') {
                await fetchUserLayers();
            } else {
                setError('User session is not authenticated. Please log in again.');
            }
        } catch (error) {
            console.error('Error checking session:', error);
            setError('Failed to verify session. Please try again.');
        }
    };

    const fetchUserLayers = async () => {
        try {
            const layersResponse = await fetch('http://127.0.0.1:5000/layers/user/layers', {
                method: 'GET',
                credentials: 'include',
            });

            if (layersResponse.ok) {
                const layersData = await layersResponse.json();
                console.log('Layers data:', layersData);
            } else {
                setError('Unauthorized access to layers. Please log in again.');
            }
        } catch (error) {
            console.error('Error fetching layers:', error);
            setError('Failed to load layers. Please try again.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, confirmPassword }),
            });

            const result = await response.json();

            if (response.ok) {
                setOtpSent(true);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setError('Something went wrong. Please try again.');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                setOtpSent(true);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error during password reset request:', error);
            setError('Something went wrong. Please try again.');
        }
    };

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, otp }),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Signup successful! Please log in.');
                setIsLogin(true);
                setOtpSent(false);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="login-popup-overlay">
            <div className="login-popup">
                {isForgotPassword ? (
                    otpSent ? (
                        <form onSubmit={handleForgotPassword} className="login-form">
                            <h2 className="login-form-title">Reset Password</h2>
                            <div className="form-group">
                                <label htmlFor="otp">OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <button type="submit" className="login-button">Reset Password</button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="login-form">
                            <h2 className="login-form-title">Forgot Password</h2>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <button type="submit" className="login-button">Send OTP</button>
                            <p onClick={() => { setIsForgotPassword(false); setIsLogin(true); }} className="toggle-form">
                                Back to Login
                            </p>
                        </form>
                    )
                ) : isLogin ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <h2 className="login-form-title">Login</h2>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="login-button">Login</button>
                        <p onClick={() => setIsForgotPassword(true)} className="toggle-form">Forgot Password?</p>
                        <p onClick={() => setIsLogin(false)} className="toggle-form">Don't have an account? Sign up</p>
                    </form>
                ) : (
                    <form onSubmit={otpSent ? handleOtpVerification : handleSignup} className="login-form">
                        <h2 className="login-form-title">{otpSent ? 'Verify OTP' : 'Sign Up'}</h2>
                        {!otpSent && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        {otpSent && (
                            <div className="form-group">
                                <label htmlFor="otp">OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={handleResendOtp} className="toggle-form">Resend OTP</button>
                            </div>
                        )}
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="login-button">{otpSent ? 'Verify OTP' : 'Sign Up'}</button>
                        {!otpSent && (
                            <p onClick={() => setIsLogin(true)} className="toggle-form">Already have an account? Login</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginSignupForm;
