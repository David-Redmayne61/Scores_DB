import React, { useState } from 'react';

function ScoreForm({ onSubmit, initialData = {}, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    composer: initialData.composer || '',
    genre: initialData.genre || '',
    instrument: initialData.instrument || '',
    difficulty: initialData.difficulty || '',
    year: initialData.year || '',
    publisher: initialData.publisher || '',
    notes: initialData.notes || '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="composer">Composer *</label>
        <input
          type="text"
          id="composer"
          name="composer"
          value={formData.composer}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="genre">Genre</label>
        <input
          type="text"
          id="genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          placeholder="e.g., Classical, Jazz, Pop"
        />
      </div>

      <div className="form-group">
        <label htmlFor="instrument">Instrument</label>
        <input
          type="text"
          id="instrument"
          name="instrument"
          value={formData.instrument}
          onChange={handleChange}
          placeholder="e.g., Piano, Violin, Orchestra"
        />
      </div>

      <div className="form-group">
        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
        >
          <option value="">Select difficulty</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="year">Year</label>
        <input
          type="number"
          id="year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="e.g., 1810"
        />
      </div>

      <div className="form-group">
        <label htmlFor="publisher">Publisher</label>
        <input
          type="text"
          id="publisher"
          name="publisher"
          value={formData.publisher}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional information about this score..."
        />
      </div>

      <div className="modal-actions">
        <button type="submit" className="btn btn-primary">
          {initialData.title ? 'Update Score' : 'Add Score'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ScoreForm;
