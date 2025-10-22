// frontend/src/pages/RetrieveDocument/RetrieveDocument.js
import React, { useState } from "react";
import axios from "axios";
import "./RetrieveDocument.css"; // optional CSS

export default function RetrieveDocument() {
  const [hash, setHash] = useState("");
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDocument = async () => {
    if (!hash.trim()) return;

    setLoading(true);
    setError("");
    setDocument(null);

    try {
      // Encode the hash for safe URL usage
      const res = await axios.get(`/api/documents/retrieve/${encodeURIComponent(hash.trim())}`);
      setDocument(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="retrieve-container">
      <h2>Retrieve Document</h2>
      <input
        type="text"
        placeholder="Enter CID or TxHash"
        value={hash}
        onChange={(e) => setHash(e.target.value)}
      />
      <button onClick={fetchDocument} disabled={loading}>
        {loading ? "Fetching..." : "Fetch Document"}
      </button>

      {error && <p className="error">{error}</p>}

      {document && (
        <div className="document-info">
          <h3>{document.name}</h3>
          <p>Type: {document.type}</p>
          <p>Uploaded At: {new Date(document.uploadedAt).toLocaleString()}</p>

          {/* Main Document Number */}
          {document.mainDocNumber && (
            <p>
              <strong>Document Number:</strong> {document.mainDocNumber}
            </p>
          )}

          {document.ipfsLink && (
            <p>
              IPFS Link:{" "}
              <a href={document.ipfsLink} target="_blank" rel="noopener noreferrer">
                {document.ipfsLink}
              </a>
            </p>
          )}
          {document.blockchainLink && (
            <p>
              Blockchain Tx:{" "}
              <a href={document.blockchainLink} target="_blank" rel="noopener noreferrer">
                {document.txHash}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
