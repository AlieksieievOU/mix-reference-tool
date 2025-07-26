import React from 'react';
import { redirectToSpotifyAuth } from '../utils/pkce';

export const LoginScreen: React.FC = () => {
    return (
        <div className="bg-spotify-black text-spotify-white flex flex-col items-center justify-center h-screen">
            <div className="text-center">
                <h2 className="text-5xl font-bold mb-2">Mix Reference Tool</h2>
                <p className="text-spotify-light-grey mb-8">Please log in with Spotify to continue.</p>
                <button
                    onClick={redirectToSpotifyAuth}
                    className="bg-spotify-green text-spotify-black font-bold py-3 px-8 rounded-full uppercase tracking-wider hover:scale-105 transition-transform duration-200"
                >
                    Login with Spotify
                </button>
            </div>
        </div>
    );
};