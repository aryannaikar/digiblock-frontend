// frontend/src/pages/RetrieveDocument/RetrieveDocument.js
import React, { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import "./RetrieveDocument.css";

export default function RetrieveDocument() {
  const [hash, setHash] = useState("");
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txStatus, setTxStatus] = useState(""); 
  const [txInfo, setTxInfo] = useState({ blockNumber: null, confirmations: 0 });
  const [verified, setVerified] = useState(false); // new

  const MAX_CONFIRMATIONS = 3;

  const getStatusClass = (status) => {
    if (status.includes("pending")) return "pending";
    if (status.includes("confirmed")) return "confirmed";
    return "failed";
  };

  const pollTransaction = async (txHash) => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      let receipt = null;
      setTxStatus("⏳ Transaction pending...");
      setVerified(false);

      while (!receipt || txInfo.confirmations < MAX_CONFIRMATIONS) {
        receipt = await provider.getTransactionReceipt(txHash);

        if (receipt) {
          const latestBlock = await provider.getBlockNumber();
          const confirmations = latestBlock - receipt.blockNumber + 1;

          setTxInfo({ blockNumber: receipt.blockNumber, confirmations });

          if (receipt.status === 1) {
            if (confirmations >= MAX_CONFIRMATIONS) {
              setTxStatus("✅ Document Verified!");
              setVerified(true); // mark document as verified
              break;
            } else {
              setTxStatus("⏳ Transaction confirmed, waiting for full confirmations...");
            }
          } else {
            setTxStatus("❌ Transaction failed");
            setVerified(false);
            break;
          }
        } else {
          setTxStatus("⏳ Transaction pending...");
        }

        await new Promise((res) => setTimeout(res, 3000));
      }
    } catch (err) {
      console.error(err);
      setTxStatus("❌ Error verifying transaction");
      setVerified(false);
    }
  };

  const fetchDocument = async () => {
    if (!hash.trim()) return;

    setLoading(true);
    setError("");
    setDocument(null);
    setTxStatus("");
    setTxInfo({ blockNumber: null, confirmations: 0 });
    setVerified(false);

    try {
      const res = await axios.get(`/api/documents/retrieve/${encodeURIComponent(hash.trim())}`);
      setDocument(res.data);

      if (res.data.txHash) {
        pollTransaction(res.data.txHash);
      }
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
          <h3>
            {document.name}{" "}
            {verified && <span className="verified-badge">✔️ Verified</span>}
          </h3>
          <p>Type: {document.type}</p>
          <p>Uploaded At: {new Date(document.uploadedAt).toLocaleString()}</p>

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

          {document.txHash && (
            <p>
              Blockchain Tx: <code>{document.txHash}</code>
            </p>
          )}

          {txStatus && (
            <p className={`tx-status ${getStatusClass(txStatus)}`}>
              {txStatus}
              {txInfo.blockNumber && ` | Block: ${txInfo.blockNumber}`}
              {txInfo.confirmations > 0 && ` | Confirmations: ${txInfo.confirmations}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
