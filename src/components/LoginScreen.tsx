import React from 'react';

// The backend URL should be in an environment variable in a real app
const BACKEND_LOGIN_URL = 'https://localhost:8888/login';


export const LoginScreen: React.FC = () => {
    return (
        <div className="login-container">
            <h2>Welcome</h2>
            <p>Please log in with Spotify to continue.</p>
            <a href={BACKEND_LOGIN_URL} className="login-button">
                Login with Spotify
            </a>
        </div>
    );
};