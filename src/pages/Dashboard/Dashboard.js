import React, { useState, useEffect } from "react";
import DocumentSorter from "./DocumentSorter";
import FolderList from "./FolderList";
import Banner from "./banner";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {

  const { user, authAxios } = useAuth();

  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH DOCUMENTS ================= */

  useEffect(() => {

    const fetchDocuments = async () => {

      if (!user) return;

      setLoading(true);
      setMessage("");

      try {
        const res = await authAxios.get("/api/documents/mydocs");

        // convert array -> folder object
        const docsByFolder = {};
        res.data.forEach(doc => {
          docsByFolder[doc.folder] = doc;
        });

        setDocuments(docsByFolder);

      } catch (err) {
        console.error("Fetch error:", err);

        if (err.response) {
          setMessage(
            `Error ${err.response.status}: ${
              err.response.data.error || "Failed to load documents"
            }`
          );
        } else if (err.request) {
          setMessage("Backend not responding. Is backend running?");
        } else {
          setMessage("Error: " + err.message);
        }

      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

  }, [user, authAxios]);

  /* ================= AFTER UPLOAD ================= */

  const handleSorted = (newDoc) => {

    // immediately update card without refresh
    setDocuments(prev => ({
      ...prev,
      [newDoc.folder]: newDoc
    }));

    setMessage(`${newDoc.folder} uploaded & secured on blockchain ✔`);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (folder) => {

    const doc = documents[folder];
    if (!doc) return;

    const confirmDelete = window.confirm(
      `Delete ${folder} document permanently?`
    );

    if (!confirmDelete) return;

    setLoading(true);

    try {

      await authAxios.delete(`/api/documents/delete/${doc._id}`);

      // remove from UI instantly
      setDocuments(prev => {
        const updated = { ...prev };
        delete updated[folder];
        return updated;
      });

      setMessage(`${folder} deleted successfully`);

    } catch (err) {
      console.error(err);
      setMessage("Failed to delete document");

    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="dashboard">

      <Banner />

      <div className="dashboard-header">
        <h2>📂 My DigiBlock Vault</h2>
        <p className="subtitle">
          Store and verify documents using decentralized blockchain storage
        </p>
      </div>

      {loading && <p className="loading">Loading your vault...</p>}
      {message && <p className="message">{message}</p>}

      {/* Upload Section */}
      <DocumentSorter onSorted={handleSorted} />

      {/* Folder Cards */}
      <FolderList
        documents={documents}
        onDelete={handleDelete}
      />

    </div>
  );
}
