import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import './App.css';

function App() {
    const { token, logout } = useSpotifyAuth();

    return (
        <div className="App">
            <header className="App-header">
                <h1>Mix Reference Analyzer</h1>
                {token && <button onClick={logout} className="logout-button">Logout</button>}
            </header>
            <main>
                {token ? <Dashboard token={token} /> : <LoginScreen />}
            </main>
        </div>
    );
}

export default App;