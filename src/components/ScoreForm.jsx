import React, { useState, useEffect, useRef } from 'react';
import { getGenres, addGenre, migrateLocalStorageGenres } from '../services/genreService';

function ScoreForm({ onSubmit, onSaveAndContinue, initialData, onCancel, onAddAnother }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    composer: initialData?.composer || '',
    arranger: initialData?.arranger || '',
    genre: initialData?.genre || '',
    genre2: initialData?.genre2 || '',
    difficulty: initialData?.difficulty || '',
    duration: initialData?.duration || '',
    notes: initialData?.notes || '',
  });

  const [formDirty, setFormDirty] = useState(false);
  const [genres, setGenres] = useState([]);
  const [showGenreInput, setShowGenreInput] = useState(false);
  const [customGenre, setCustomGenre] = useState('');
  const [genreError, setGenreError] = useState('');
  const titleInputRef = useRef(null);

  // Load genres from Firestore on mount and migrate localStorage
  useEffect(() => {
    loadGenres();
  }, []);

  // Focus the title field when component mounts or when initialData changes to null (Add Another)
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [initialData]);

  async function loadGenres() {
    // First migrate any localStorage genres to Firestore
    await migrateLocalStorageGenres();
    // Then load the complete list
    const genreList = await getGenres();
    setGenres(genreList);
  }

  async function handleAddCustomGenre() {
    if (customGenre.trim()) {
      const newGenre = customGenre.trim();
      const result = await addGenre(newGenre);
      
      if (result.success) {
        setGenres(result.genres);
        // Determine which field triggered the custom genre
        const targetField = formData.genre === '__custom__' ? 'genre' : 'genre2';
        setFormData((prev) => ({ ...prev, [targetField]: newGenre }));
        setCustomGenre('');
        setShowGenreInput(false);
        setGenreError('');
      } else {
        setGenreError(result.message);
      }
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormDirty(true);
    if ((name === 'genre' || name === 'genre2') && value === '__custom__') {
      setShowGenreInput(true);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormDirty(false);
    onSubmit(formData);
  }

  async function handleAddAnother() {
    if (formDirty && (formData.title || formData.composer)) {
      // Save current record first using the save and continue handler
      const form = document.querySelector('form');
      if (form.checkValidity()) {
        try {
          if (onSaveAndContinue) {
            await onSaveAndContinue(formData);
          }
          setFormDirty(false);
          if (onAddAnother) {
            onAddAnother();
          }
        } catch (err) {
          // Error handled in parent
        }
      } else {
        form.reportValidity();
      }
    } else if (onAddAnother) {
      onAddAnother();
    }
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
          ref={titleInputRef}
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
        <label htmlFor="arranger">Arranger</label>
        <input
          type="text"
          id="arranger"
          name="arranger"
          value={formData.arranger}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="genre">Genre</label>
        <select
          id="genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
        >
          <option value="">Select genre</option>
          {genres.sort().map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          <option value="__custom__">+ Add New Genre</option>
        </select>

        {(showGenreInput || formData.genre === '__custom__') && (
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              placeholder="Enter new genre..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomGenre();
                }
              }}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddCustomGenre}
              style={{ padding: '0.5rem 1rem' }}
            >
              Add
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowGenreInput(false);
                setCustomGenre('');
                if (formData.genre === '__custom__') {
                  setFormData((prev) => ({ ...prev, genre: '' }));
                }
              }}
              style={{ padding: '0.5rem 1rem' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="genre2">Genre 2 (Optional)</label>
        <select
          id="genre2"
          name="genre2"
          value={formData.genre2}
          onChange={handleChange}
        >
          <option value="">Select second genre</option>
          {genres.sort().map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          <option value="__custom__">+ Add New Genre</option>
        </select>

        {(showGenreInput || formData.genre2 === '__custom__') && formData.genre !== '__custom__' && (
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            {genreError && <div style={{ color: '#dc3545', fontSize: '0.9rem' }}>{genreError}</div>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={customGenre}
                onChange={(e) => {
                  setCustomGenre(e.target.value);
                  setGenreError('');
                }}
                placeholder="Enter new genre..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomGenre();
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddCustomGenre}
                style={{ padding: '0.5rem 1rem' }}
              >
                Add
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowGenreInput(false);
                  setCustomGenre('');
                  setGenreError('');
                  if (formData.genre2 === '__custom__') {
                    setFormData((prev) => ({ ...prev, genre2: '' }));
                  }
                }}
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
        <label htmlFor="duration">Duration (MM:SS)</label>
        <input
          type="text"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g., 3:45 or 12:30"
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
        {!initialData?.title && onAddAnother ? (
          <>
            <button type="submit" className="btn btn-secondary">
              Save & Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handleAddAnother}>
              Save & Add Another
            </button>
          </>
        ) : (
          <button type="submit" className="btn btn-primary">
            {initialData?.title ? 'Update Score' : 'Save'}
          </button>
        )}
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
