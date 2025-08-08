import React from 'react';
import './Dashboard.css';

export default function FolderList({ documents, onDelete }) {
  return (
    <div>
      <h3>🗂 Uploaded Documents</h3>
      {Object.keys(documents).length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul>
          {Object.entries(documents).map(([folder, doc]) => (
            <li key={folder} style={{ marginBottom: '10px' }}>
              <strong>{folder}</strong>: {doc.name} ({Math.round(doc.size / 1024)} KB)
              {' '}
              <button onClick={() => window.open(doc.data, '_blank')}>🔍 View</button>
              {' '}
              <button onClick={() => onDelete(folder)} style={{ color: 'red' }}>🗑 Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
