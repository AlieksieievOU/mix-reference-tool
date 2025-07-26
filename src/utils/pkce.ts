// Generates a random string of a given length
function generateRandomString(length: number): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Hashes the verifier using SHA-256
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    // Base64-urlencode the hash
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// This is the main function you'll call from your component
export async function redirectToSpotifyAuth() {
    const verifier = generateRandomString(128);
    // Store the verifier in local storage to use it after the redirect
    window.localStorage.setItem('pkce_code_verifier', verifier);

    const challenge = await generateCodeChallenge(verifier);

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    // Add 'streaming' and playback control scopes
    const scope = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state',
    ].join(' ');

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', redirectUri);
    params.append('scope', scope);
    params.append('code_challenge_method', 'S256');
    params.append('code_challenge', challenge);

    // Redirect the user to the Spotify authorization page
    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}