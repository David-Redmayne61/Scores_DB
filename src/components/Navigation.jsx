import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <nav>
      <div className="nav-content">
        <h1>🎵 Music Scores Database</h1>
        <div className="nav-links">
          {currentUser ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <span>{currentUser.email}</span>
              <button onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
