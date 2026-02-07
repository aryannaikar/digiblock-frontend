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

  /* FILTER STATE */
  const [filter, setFilter] = useState("all");

  /* ================= FETCH DOCUMENTS ================= */

  useEffect(() => {

    const fetchDocuments = async () => {
      if (!user) return;

      setLoading(true);

      try {
        const res = await authAxios.get("/api/documents/mydocs");

        const docsByFolder = {};
        res.data.forEach(doc => {
          docsByFolder[doc.folder] = doc;
        });

        setDocuments(docsByFolder);

      } catch (err) {
        console.error(err);
        setMessage("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

  }, [user, authAxios]);

  /* ================= AFTER UPLOAD ================= */

  const handleSorted = (newDoc) => {
    setDocuments(prev => ({
      ...prev,
      [newDoc.folder]: newDoc
    }));
  };

  /* ================= DELETE ================= */

  const handleDelete = async (folder) => {

    const doc = documents[folder];
    if (!doc) return;

    if (!window.confirm(`Delete ${folder} document?`)) return;

    try {
      await authAxios.delete(`/api/documents/delete/${doc._id}`);

      setDocuments(prev => {
        const updated = { ...prev };
        delete updated[folder];
        return updated;
      });

    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="dashboard-layout">

      {/* LEFT SIDE - SLIDESHOW */}
      <div className="left-panel">
        <Banner />
      </div>

      {/* RIGHT SIDE - DASHBOARD */}
      <div className="right-panel">

        <div className="vault-card">

          <div className="vault-header">

            <h3>📁 Dashboard</h3>

            {/* FILTER TABS */}
            <div className="tabs">

              <button
                className={`tab-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>

              <button
                className={`tab-btn ${filter === "uploaded" ? "active" : ""}`}
                onClick={() => setFilter("uploaded")}
              >
                Uploaded
              </button>

              <button
                className={`tab-btn ${filter === "missing" ? "active" : ""}`}
                onClick={() => setFilter("missing")}
              >
                Missing
              </button>

            </div>

          </div>

          {loading && <p className="loading">Loading documents...</p>}
          {message && <p className="message">{message}</p>}

          {/* Upload */}
          <DocumentSorter onSorted={handleSorted} />

          {/* Cards */}
          <FolderList
            documents={documents}
            onDelete={handleDelete}
            filter={filter}
          />

        </div>

      </div>

    </div>
  );
}
