import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
      setUser(username);
      setLoading(false);
    } else if (token) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setUser(data.username);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? '/chat' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
