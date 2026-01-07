import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserScores,
  createScore,
  updateScore,
  deleteScore,
  searchScores,
} from '../services/scoreService';
import ScoreForm from '../components/ScoreForm';

function Dashboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    loadScores();
  }, [currentUser]);

  async function loadScores() {
    try {
      setLoading(true);
      const data = await getUserScores(currentUser.uid);
      setScores(data);
      setError('');
    } catch (err) {
      setError('Failed to load scores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      loadScores();
      return;
    }

    try {
      const results = await searchScores(currentUser.uid, term);
      setScores(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  async function handleCreateScore(scoreData) {
    try {
      await createScore(scoreData, currentUser.uid);
      setShowModal(false);
      loadScores();
    } catch (err) {
      setError('Failed to create score');
      console.error(err);
    }
  }

  async function handleUpdateScore(scoreData) {
    try {
      await updateScore(editingScore.id, scoreData);
      setShowModal(false);
      setEditingScore(null);
      loadScores();
    } catch (err) {
      setError('Failed to update score');
      console.error(err);
    }
  }

  async function handleDeleteScore(scoreId) {
    if (!window.confirm('Are you sure you want to delete this score?')) {
      return;
    }

    try {
      await deleteScore(scoreId);
      loadScores();
    } catch (err) {
      setError('Failed to delete score');
      console.error(err);
    }
  }

  function openAddModal() {
    setEditingScore(null);
    setShowModal(true);
  }

  function openEditModal(score) {
    setEditingScore(score);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingScore(null);
  }

  if (loading) {
    return <div className="loading">Loading scores...</div>;
  }

  return (
    <div className="container">
      <div className="scores-header">
        <h2>My Music Scores</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            className="search-box"
            placeholder="Search by title or composer..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="btn btn-success" onClick={openAddModal}>
            + Add Score
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {scores.length === 0 ? (
        <div className="empty-state">
          <h3>No scores yet</h3>
          <p>Start building your music library by adding your first score!</p>
        </div>
      ) : (
        <div className="scores-grid">
          {scores.map((score) => (
            <div key={score.id} className="score-card">
              <h3>{score.title}</h3>
              <p><strong>Composer:</strong> {score.composer}</p>
              {score.genre && <p><strong>Genre:</strong> {score.genre}</p>}
              {score.instrument && <p><strong>Instrument:</strong> {score.instrument}</p>}
              {score.difficulty && <p><strong>Difficulty:</strong> {score.difficulty}</p>}
              {score.year && <p><strong>Year:</strong> {score.year}</p>}
              {score.publisher && <p><strong>Publisher:</strong> {score.publisher}</p>}
              {score.notes && <p><strong>Notes:</strong> {score.notes}</p>}
              <div className="actions">
                <button
                  className="btn btn-primary"
                  onClick={() => openEditModal(score)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteScore(score.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingScore ? 'Edit Score' : 'Add New Score'}</h2>
            <ScoreForm
              onSubmit={editingScore ? handleUpdateScore : handleCreateScore}
              initialData={editingScore}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
