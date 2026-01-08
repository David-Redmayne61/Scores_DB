import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserScores } from '../services/scoreService';
import { useNavigate } from 'react-router-dom';
import logo from '../Resources/LCB.png';

function Dashboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalScores: 0,
    recentAdditions: 0,
    lastAdded: null,
    lastEdited: null,
    genreBreakdown: {},
    difficultyBreakdown: {},
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadScores();
  }, [currentUser]);

  async function loadScores() {
    try {
      setLoading(true);
      const data = await getUserScores(currentUser.uid);
      setScores(data);
      calculateStats(data);
      setError('');
    } catch (err) {
      setError('Failed to load scores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(scoresData) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Count recent additions (last 24 hours)
    const recentAdditions = scoresData.filter((score) => {
      if (!score.createdAt) return false;
      const createdDate = new Date(score.createdAt.seconds * 1000);
      return createdDate >= twentyFourHoursAgo;
    }).length;

    // Find last added
    const lastAdded = scoresData.reduce((latest, score) => {
      if (!score.createdAt) return latest;
      if (!latest || score.createdAt.seconds > latest.createdAt.seconds) {
        return score;
      }
      return latest;
    }, null);

    // Find last edited
    const lastEdited = scoresData.reduce((latest, score) => {
      if (!score.updatedAt) return latest;
      if (!latest || score.updatedAt.seconds > latest.updatedAt.seconds) {
        return score;
      }
      return latest;
    }, null);

    // Genre breakdown
    const genreBreakdown = {};
    scoresData.forEach((score) => {
      if (score.genre) {
        genreBreakdown[score.genre] = (genreBreakdown[score.genre] || 0) + 1;
      }
      if (score.genre2) {
        genreBreakdown[score.genre2] = (genreBreakdown[score.genre2] || 0) + 1;
      }
    });

    // Difficulty breakdown
    const difficultyBreakdown = {};
    scoresData.forEach((score) => {
      if (score.difficulty) {
        difficultyBreakdown[score.difficulty] = (difficultyBreakdown[score.difficulty] || 0) + 1;
      }
    });

    setStats({
      totalScores: scoresData.length,
      recentAdditions,
      lastAdded,
      lastEdited,
      genreBreakdown,
      difficultyBreakdown,
    });
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <img src={logo} alt="LCB Logo" className="dashboard-logo" />
        <h2>Dashboard</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Scores</h3>
          <div className="stat-number">{stats.totalScores}</div>
          <button className="btn btn-primary" onClick={() => navigate('/library')}>
            View Library
          </button>
        </div>

        <div className="stat-card">
          <h3>Recent Additions</h3>
          <div className="stat-number">{stats.recentAdditions}</div>
          <p className="stat-label">Last 24 hours</p>
        </div>

        <div className="stat-card">
          <h3>Last Added</h3>
          {stats.lastAdded ? (
            <>
              <div className="stat-text">{stats.lastAdded.title}</div>
              <p className="stat-label">{formatDate(stats.lastAdded.createdAt)}</p>
            </>
          ) : (
            <div className="stat-text">No scores yet</div>
          )}
        </div>

        <div className="stat-card">
          <h3>Last Edited</h3>
          {stats.lastEdited ? (
            <>
              <div className="stat-text">{stats.lastEdited.title}</div>
              <p className="stat-label">{formatDate(stats.lastEdited.updatedAt)}</p>
            </>
          ) : (
            <div className="stat-text">No edits yet</div>
          )}
        </div>
      </div>

      <div className="dashboard-row">
        <div className="breakdown-card">
          <h3>Genre Breakdown</h3>
          {Object.keys(stats.genreBreakdown).length > 0 ? (
            <div className="breakdown-list">
              {Object.entries(stats.genreBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([genre, count]) => (
                  <div key={genre} className="breakdown-item">
                    <span className="breakdown-label">{genre}</span>
                    <span className="breakdown-value">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="empty-text">No genre data yet</p>
          )}
        </div>

        <div className="breakdown-card">
          <h3>Difficulty Breakdown</h3>
          {Object.keys(stats.difficultyBreakdown).length > 0 ? (
            <div className="breakdown-list">
              {['Beginner', 'Intermediate', 'Advanced', 'Expert']
                .filter((diff) => stats.difficultyBreakdown[diff])
                .map((difficulty) => (
                  <div key={difficulty} className="breakdown-item">
                    <span className="breakdown-label">{difficulty}</span>
                    <span className="breakdown-value">{stats.difficultyBreakdown[difficulty]}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="empty-text">No difficulty data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}


export default Dashboard;
