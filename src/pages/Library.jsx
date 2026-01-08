import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserScores,
  createScore,
  updateScore,
  deleteScore,
} from '../services/scoreService';
import ScoreForm from '../components/ScoreForm';
import logo from '../Resources/LCB.png';

function Library() {
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    difficulty: '',
  });
  const [importing, setImporting] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadScores();
  }, [currentUser]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [scores, filters, sortField, sortDirection]);

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

  function applyFiltersAndSort() {
    let result = [...scores];

    // Apply filters
    if (filters.search) {
      const searchPattern = filters.search.toLowerCase();
      
      // Convert wildcard pattern to regex
      // * matches any characters, ? matches single character
      const regexPattern = searchPattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except * and ?
        .replace(/\*/g, '.*') // * becomes .*
        .replace(/\?/g, '.'); // ? becomes .
      
      const regex = new RegExp(regexPattern, 'i');
      
      result = result.filter(
        (score) =>
          regex.test(score.title) ||
          regex.test(score.composer) ||
          (score.arranger && regex.test(score.arranger))
      );
    }

    if (filters.genre) {
      result = result.filter(
        (score) =>
          score.genre === filters.genre || score.genre2 === filters.genre
      );
    }

    if (filters.difficulty) {
      result = result.filter((score) => score.difficulty === filters.difficulty);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      // Handle dates
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = a[sortField]?.seconds || 0;
        bVal = b[sortField]?.seconds || 0;
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredScores(result);
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function clearFilters() {
    setFilters({ search: '', genre: '', difficulty: '' });
  }

  function checkDuplicateTitle(title) {
    return scores.some(
      (score) => score.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
  }

  async function handleCreateScore(scoreData) {
    // Check for duplicate
    if (checkDuplicateTitle(scoreData.title)) {
      const proceed = window.confirm(
        `A score with the title "${scoreData.title}" already exists. Do you want to add it anyway?`
      );
      if (!proceed) {
        return; // Cancel the operation
      }
    }

    try {
      await createScore(scoreData, currentUser.uid);
      await loadScores();
    } catch (err) {
      setError('Failed to create score');
      console.error(err);
      throw err; // Re-throw so form knows save failed
    }
  }

  function handleCreateAndClose(scoreData) {
    return handleCreateScore(scoreData).then(() => {
      setShowModal(false);
      setEditingScore(null);
    });
  }

  function handleAddAnother() {
    setEditingScore(null);
    // Keep modal open, just reset the form by setting editingScore to null
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

  function exportToCSV() {
    const headers = ['Title', 'Composer', 'Arranger', 'Genre', 'Genre 2', 'Difficulty', 'Duration', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredScores.map((score) =>
        [
          `"${score.title || ''}"`,
          `"${score.composer || ''}"`,
          `"${score.arranger || ''}"`,
          `"${score.genre || ''}"`,
          `"${score.genre2 || ''}"`,
          `"${score.difficulty || ''}"`,
          `"${score.duration || ''}"`,
          `"${(score.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `music-scores-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    window.print();
  }

  function handleImportClick() {
    document.getElementById('csv-import-input').click();
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  }

  async function handleImportCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setError('');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Skip header row
      const dataLines = lines.slice(1);
      
      // First pass: check for duplicates and validate
      const duplicates = [];
      const validRows = [];
      const duplicateIndices = new Set();
      let invalidCount = 0;

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const cleanValues = parseCSVLine(line);

        if (cleanValues.length < 2 || !cleanValues[0] || !cleanValues[1]) {
          invalidCount++;
          continue; // Skip invalid rows
        }

        const title = cleanValues[0];
        if (checkDuplicateTitle(title)) {
          duplicates.push(title);
          duplicateIndices.add(validRows.length); // Mark this row index as duplicate
        }
        validRows.push(cleanValues);
      }

      // If duplicates found, ask user what to do
      let skipDuplicates = false;
      if (duplicates.length > 0) {
        const skipThem = window.confirm(
          `Found ${duplicates.length} duplicate title(s):\n${duplicates.slice(0, 5).join('\n')}${duplicates.length > 5 ? '\n...' : ''}\n\nDo you want to SKIP the duplicates and import only the new records?\n\nClick OK to skip duplicates, or Cancel to see other options.`
        );
        
        if (skipThem) {
          skipDuplicates = true;
        } else {
          // Ask if they want to import duplicates anyway
          const importAll = window.confirm(
            `Do you want to import ALL records including the ${duplicates.length} duplicate(s)?\n\nClick OK to import everything, or Cancel to abort the import.`
          );
          
          if (!importAll) {
            setImporting(false);
            event.target.value = '';
            setError(`Import cancelled. Summary:\n• Total rows: ${dataLines.length}\n• Valid rows: ${validRows.length}\n• Duplicates found: ${duplicates.length}\n• Invalid rows: ${invalidCount}\n• Imported: 0`);
            return; // Cancel import
          }
        }
      }

      // Second pass: import valid rows (skip duplicates if requested)
      let importedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < validRows.length; i++) {
        const cleanValues = validRows[i];
        
        // Skip if this is a duplicate and user chose to skip duplicates
        if (skipDuplicates && duplicateIndices.has(i)) {
          skippedCount++;
          continue;
        }

        try {
          const scoreData = {
            title: cleanValues[0] || '',
            composer: cleanValues[1] || '',
            arranger: cleanValues[2] || '',
            genre: cleanValues[3] || '',
            genre2: cleanValues[4] || '',
            difficulty: cleanValues[5] || '',
            duration: cleanValues[6] || '',
            notes: cleanValues[7] || '',
          };

          await createScore(scoreData, currentUser.uid);
          importedCount++;
        } catch (err) {
          console.error('Error importing row:', err);
          errorCount++;
        }
      }

      // Detailed summary message
      const summaryParts = [
        `✅ Import Complete!`,
        `• Total rows in file: ${dataLines.length}`,
        `• Successfully imported: ${importedCount}`,
      ];
      
      if (invalidCount > 0) {
        summaryParts.push(`• Invalid rows (missing title/composer): ${invalidCount}`);
      }
      
      if (skippedCount > 0) {
        summaryParts.push(`• Duplicates skipped: ${skippedCount}`);
      } else if (duplicates.length > 0) {
        summaryParts.push(`• Duplicates imported: ${duplicates.length}`);
      }
      
      if (errorCount > 0) {
        summaryParts.push(`• Errors during import: ${errorCount}`);
      }

      await loadScores();
      setError(summaryParts.join('\n'));
    } catch (err) {
      setError(`Failed to import CSV: ${err.message}`);
      console.error(err);
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset input
    }
  }

  // Get unique genres for filter dropdown
  const uniqueGenres = [...new Set(scores.flatMap((s) => [s.genre, s.genre2].filter(Boolean)))].sort();

  if (loading) {
    return <div className="loading">Loading scores...</div>;
  }

  return (
    <div className="container library-container">
      <div className="print-header">
        <img src={logo} alt="LCB Logo" className="print-logo" />
        <h1>LCB Score Library</h1>
      </div>
      
      <div className="library-header">
        <h2>Music Library</h2>
        <div className="library-actions">
          <input
            id="csv-import-input"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleImportCSV}
          />
          <button 
            className="btn btn-secondary" 
            onClick={handleImportClick}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            Export to CSV
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            Print
          </button>
          <button className="btn btn-success" onClick={openAddModal}>
            + Add Score
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          <button className="error-close" onClick={() => setError('')}>
            ×
          </button>
          {error}
        </div>
      )}

      <div className="filters-section">
        <input
          type="text"
          name="search"
          className="filter-input"
          placeholder="Search by title, composer, or arranger... (* for any, ? for one char)"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select
          name="genre"
          className="filter-select"
          value={filters.genre}
          onChange={handleFilterChange}
        >
          <option value="">All Genres</option>
          {uniqueGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <select
          name="difficulty"
          className="filter-select"
          value={filters.difficulty}
          onChange={handleFilterChange}
        >
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        {(filters.search || filters.genre || filters.difficulty) && (
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
        <span className="results-count">
          Showing {filteredScores.length} of {scores.length} scores
        </span>
      </div>

      {filteredScores.length === 0 ? (
        <div className="empty-state">
          <h3>No scores found</h3>
          <p>
            {scores.length === 0
              ? 'Start building your music library by adding your first score!'
              : 'Try adjusting your filters or search term.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="scores-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} className="sortable">
                  Title {sortField === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('composer')} className="sortable">
                  Composer {sortField === 'composer' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('arranger')} className="sortable">
                  Arranger {sortField === 'arranger' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('genre')} className="sortable">
                  Genre {sortField === 'genre' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('difficulty')} className="sortable">
                  Difficulty {sortField === 'difficulty' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('duration')} className="sortable">
                  Duration {sortField === 'duration' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((score) => (
                <tr key={score.id}>
                  <td>{score.title}</td>
                  <td>{score.composer}</td>
                  <td>{score.arranger || '-'}</td>
                  <td>
                    {score.genre}
                    {score.genre2 && `, ${score.genre2}`}
                  </td>
                  <td>{score.difficulty || '-'}</td>
                  <td>{score.duration || '-'}</td>
                  <td className="actions-col">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEditModal(score)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteScore(score.id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingScore ? 'Edit Score' : 'Add New Score'}</h2>
            <ScoreForm
              onSubmit={editingScore ? handleUpdateScore : handleCreateAndClose}
              onSaveAndContinue={!editingScore ? handleCreateScore : undefined}
              initialData={editingScore}
              onCancel={closeModal}
              onAddAnother={!editingScore ? handleAddAnother : undefined}
            />
          </div>
        </div>
      )}
      
      <div className="print-footer">
        LCB Score Library
      </div>
    </div>
  );
}

export default Library;
