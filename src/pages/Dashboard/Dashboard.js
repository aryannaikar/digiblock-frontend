import React, { useState, useEffect } from 'react';
import DocumentSorter from './DocumentSorter';
import FolderList from './FolderList';
import './Dashboard.css';
import Banner from './banner';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, authAxios } = useAuth(); // Use authAxios for automatic token handling

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return; // not logged in yet
      setLoading(true);
      try {
        const res = await authAxios.get('/api/upload/mydocs');
        const docsByFolder = {};
        res.data.forEach(doc => {
          docsByFolder[doc.folder] = doc;
        });
        setDocuments(docsByFolder);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          setMessage('Please log in to view your documents.');
        } else {
          setMessage('Failed to load documents');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [user, authAxios]);

  const handleSorted = (newDoc) => {
    const { folder } = newDoc;
    if (documents[folder]) {
      alert(`${folder} document already uploaded.`);
      return;
    }
    setDocuments(prev => ({ ...prev, [folder]: newDoc }));
    setMessage(`Uploaded "${folder}" successfully!`);
  };

  const handleDelete = async (folder) => {
    const doc = documents[folder];
    if (!doc) return;
    if (!window.confirm(`Delete ${folder} document?`)) return;

    setLoading(true);
    try {
      await authAxios.delete(`/api/upload/delete/${doc._id}`);
      setDocuments(prev => {
        const updated = { ...prev };
        delete updated[folder];
        return updated;
      });
      setMessage(`Deleted "${folder}" successfully!`);
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Banner />
      <h2>📂 Dashboard</h2>
      {loading && <p className="loading">Loading...</p>}
      {message && <p className="message">{message}</p>}
      <DocumentSorter onSorted={handleSorted} />
      <FolderList documents={documents} onDelete={handleDelete} />
    </div>
  );
}
