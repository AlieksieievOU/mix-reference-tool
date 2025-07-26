// src/App.tsx
import React, { useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';

const App: React.FC = () => {
    const { token, isLoading, error, logout, exchangeCodeForToken, clearError } = useSpotifyAuth();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const verifier = window.localStorage.getItem('pkce_code_verifier');

        if (code && verifier) {
            exchangeCodeForToken(code, verifier);
        }
    }, [exchangeCodeForToken]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-spotify-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
                    <p className="text-spotify-white">Authenticating with Spotify...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="App bg-spotify-black min-h-screen">
            {error && (
                <div className="bg-red-600 text-white p-4 m-4 rounded-lg shadow-lg flex justify-between items-center">
                    <p>{error}</p>
                    <button
                        onClick={clearError}
                        className="bg-red-800 px-3 py-1 rounded text-sm hover:bg-red-900 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            )}
            {token ? <Dashboard token={token} onLogout={logout} /> : <LoginScreen />}
        </div>
    );
};

export default App;