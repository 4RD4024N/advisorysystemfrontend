import React, { useState } from 'react';
import { searchService } from '../services';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tagsLoaded, setTagsLoaded] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Arama sonuçlarını getir
      const data = await searchService.searchDocuments({ query, page: 1, pageSize: 20 });
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularTags = async () => {
    if (tagsLoaded) return;
    try {
      const data = await searchService.getPopularTags(10);
      setPopularTags(data);
      setTagsLoaded(true);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  return (
    <div>
      <h1 className="mb-4">Search Documents</h1>

      <div className="card mb-3">
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input"
              placeholder="Search for documents..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading"></span> : '🔍 Search'}
            </button>
          </div>
        </form>

        <div className="mt-3">
          <button onClick={loadPopularTags} className="btn btn-secondary btn-sm">
            Show Popular Tags
          </button>
          {popularTags.length > 0 && (
            <div className="mt-2">
              {popularTags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(tag.tag);
                    handleSearch({ preventDefault: () => {} });
                  }}
                  className="badge badge-primary"
                  style={{ marginRight: '8px', marginBottom: '8px', cursor: 'pointer', border: 'none' }}
                >
                  {tag.tag} ({tag.count})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="card">
          <div className="flex-between mb-3">
            <h2 className="card-header" style={{ marginBottom: 0 }}>
              Results ({results.totalCount})
            </h2>
            <div className="text-sm text-muted">
              Page {results.page} of {results.totalPages}
            </div>
          </div>

          {results.documents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-text">No documents found</div>
              <div className="empty-state-subtext">Try a different search term</div>
            </div>
          ) : (
            <div className="grid grid-2">
              {results.documents.map((doc) => (
                <div key={doc.id} className="card">
                  <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>
                    <Link to={`/documents/${doc.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {doc.title}
                    </Link>
                  </h3>
                  
                  <div className="mb-2">
                    {doc.tags && doc.tags.split(',').map((tag, i) => (
                      <span key={i} className="badge badge-primary" style={{ marginRight: '6px', marginBottom: '6px' }}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="flex-between mt-3" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <div className="text-sm text-muted">
                      {doc.versionCount || 0} versions
                    </div>
                    <div className="text-sm text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
