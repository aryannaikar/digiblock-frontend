import React, { useState } from 'react';
import DocumentSorter from './DocumentSorter';
import FolderList from './FolderList';
import './Dashboard.css';

export default function Dashboard() {
  const [documents, setDocuments] = useState({});

  const handleSorted = (newDoc) => {
    const { folder } = newDoc;

    if (documents[folder]) {
      alert(`${folder} document already uploaded.`);
      return;
    }

    setDocuments(prev => ({ ...prev, [folder]: newDoc }));
  };

  const handleDelete = (folder) => {
    if (window.confirm(`Delete ${folder} document?`)) {
      setDocuments(prev => {
        const updated = { ...prev };
        delete updated[folder];
        return updated;
      });
    }
  };

  return (
    <div className="dashboard">
      <h2>📂 Dashboard</h2>
      <DocumentSorter onSorted={handleSorted} />
      <FolderList documents={documents} onDelete={handleDelete} />
    </div>
  );
}
