import React, { useState } from 'react';
import './LoginPopup.css';

const LoginPopup = ({ onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isSignup, setIsSignup] = useState(false);
    const [isOtpVerification, setIsOtpVerification] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);


    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Username and password are required");
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch("http://54.224.177.87/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok && data.access_token) {
                localStorage.setItem("access_token", data.access_token);
                onClose(data.access_token);
            } else {
                setError(data.message || "Invalid credentials. Please try again.");
            }
        } catch (error) {
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!username || !password || !email) {
            setError("All fields are required for signup");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch("http://54.224.177.87/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, email })
            });
            const data = await response.json();

            if (response.ok) {
                setIsSignup(false);
                setIsOtpVerification(true);
            } else {
                setError(data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError("OTP is required");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch("http://54.224.177.87/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, otp })
            });
            const data = await response.json();

            if (response.ok) {
                setIsOtpVerification(false);
                setIsLogin(true);
            } else {
                setError(data.message || "Invalid OTP. Please try again.");
            }
        } catch (error) {
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch("http://54.224.177.87/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to resend OTP. Please try again.");
            }
        } catch (error) {
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!username) {
            setError("Username is required to reset password");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch("http://54.224.177.87/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });
            const data = await response.json();

            if (response.ok) {
                setIsForgotPassword(false);
                setIsOtpVerification(true);
            } else {
                setError(data.message || "Failed to initiate password reset. Please try again.");
            }
        } catch (error) {
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <span className="close-button" onClick={() => onClose(null)}>&times;</span>
                <h2>{isLogin ? 'Login' : isSignup ? 'Sign Up' : isOtpVerification ? 'OTP Verification' : 'Forgot Password'}</h2>
                
                <form onSubmit={(e) => e.preventDefault()}>
                    {!isOtpVerification && (
                        <>
                            <label htmlFor="username">Username:</label>
                            <input type="username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </>
                    )}
                    
                    {(isSignup || isForgotPassword) && (
                        <>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </>
                    )}
                    
                    {(isLogin || isSignup) && !isOtpVerification && (
                        <>
                            <label htmlFor="password">Password:</label>
                            <div className="password-container">
                                <input
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className="toggle-password"
                                    onClick={togglePasswordVisibility}
                                >
                                    {isPasswordVisible ? '🙈' : '👁️'}
                                </span>
                            </div>
                        </>
                    )}
                    
                    {isOtpVerification && (
                        <>
                            <label htmlFor="otp">OTP:</label>
                            <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                            <button type="button" onClick={handleVerifyOtp} disabled={loading}>Verify OTP</button>
                            <button type="button" onClick={handleResendOtp} disabled={loading}>Resend OTP</button>
                        </>
                    )}

                    {!isOtpVerification && (
                        <button type="button" onClick={isLogin ? handleLogin : isSignup ? handleSignup : handleForgotPassword} disabled={loading}>
                            {loading ? 'Processing...' : isLogin ? 'Login' : isSignup ? 'Sign Up' : 'Reset Password'}
                        </button>
                    )}
                    
                    {error && <p className="error-message">{error}</p>}
                    <p>
                        {isLogin ? (
                            <>
                                <span onClick={() => { setIsLogin(false); setIsSignup(true); }}>Sign Up</span> | 
                                <span onClick={() => { setIsLogin(false); setIsForgotPassword(true); }}>Forgot Password?</span>
                            </>
                        ) : (
                            <span onClick={() => { setIsLogin(true); setIsSignup(false); setIsForgotPassword(false); setIsOtpVerification(false); }}>Back to Login</span>
                        )}
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPopup;
