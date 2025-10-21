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
  const { user, authAxios } = useAuth();

// Fetch documents
useEffect(() => {
  const fetchDocuments = async () => {
    if (!user) return; // not logged in yet
    setLoading(true);
    setMessage(''); // clear previous messages
    try {
      const res = await authAxios.get('/api/documents/mydocs'); // ensure this matches server route
      console.log('Documents response:', res.data); // log full response
      const docsByFolder = {};
      res.data.forEach(doc => {
        docsByFolder[doc.folder] = doc;
      });
      setDocuments(docsByFolder);
    } catch (err) {
      console.error('Fetch documents error:', err);

      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        setMessage(`Error ${err.response.status}: ${err.response.data.error || err.response.data.message || 'Failed to load documents'}`);
      } else if (err.request) {
        console.error('Request made but no response received:', err.request);
        setMessage('No response from server. Is backend running?');
      } else {
        console.error('Axios setup error:', err.message);
        setMessage('Request setup error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchDocuments();
}, [user, authAxios]);


  const handleSorted = (newDoc) => {
    const { folder } = newDoc;
    setDocuments(prev => ({ ...prev, [folder]: newDoc }));
    setMessage(`Uploaded "${folder}" successfully!`);
  };

  const handleDelete = async (folder) => {
    const doc = documents[folder];
    if (!doc) return;
    if (!window.confirm(`Delete ${folder} document?`)) return;

    setLoading(true);
    try {
      await authAxios.delete(`/api/documents/delete/${doc._id}`); // ✅ updated route
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
