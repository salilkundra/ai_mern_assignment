import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

// Helper component to handle "More..." logic
const ExpandableText = ({ text, limit = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text && text.length > limit;

  return (
    <div className="card-response">
      <p>
        {isExpanded || !shouldTruncate ? text : `${text.substring(0, limit)}...`}
        {shouldTruncate && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={{ 
              all: 'unset', 
              color: '#007bff', 
              cursor: 'pointer', 
              fontWeight: '600', 
              marginLeft: '8px',
              fontSize: '13px'
            }}
          >
            {isExpanded ? 'Show less' : 'More...'}
          </button>
        )}
      </p>
    </div>
  );
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/history');
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="history-page">
      <header className="history-header">
        <h1>Saved AI Insights</h1>
        <button onClick={() => navigate('/')} className="btn-run">
          ← Back to Dashboard
        </button>
      </header>

      {loading ? (
        <div className="loading-text">Waking up database...</div>
      ) : (
        <>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <p>No saved flows found yet.</p>
              <button className="btn-save" onClick={() => navigate('/')}>
                Create your first Flow
              </button>
            </div>
          ) : (
            <div className="history-grid">
              {history.map((item) => (
                <div key={item._id || item.id} className="history-card">
                  <div className="card-tag">User Input</div>
                  <p className="card-prompt">{item.prompt}</p>
                  
                  <div className="card-tag">AI Response</div>
                  {/* Replaced the static p tag with our expandable component */}
                  <ExpandableText text={item.response} />
                  
                  <span className="card-date">
                    Saved on: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}