import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./Dashboard.css";

const ALL_FOLDERS = [
  "Aadhaar",
  "PAN",
  "Passport",
  "Voter",
  "Driving License",
  "Birth Certificate",
  "10th Marksheet",
  "12th Marksheet",
  "Degree Certificate",
  "Caste Certificate",
];

const folderColors = [
  "#6A1B9A",
  "#1565C0",
  "#512DA8",
  "#0277BD",
  "#880E4F",
  "#283593",
  "#2E7D32",
  "#FF6F00",
  "#5D4037",
  "#455A64",
];

export default function FolderList({ documents, onDelete, filter }) {
  const [infoDoc, setInfoDoc] = useState(null);
  const [verifyDoc, setVerifyDoc] = useState(null);

  const BASE_URL = "http://localhost:5000";

  const filteredFolders = ALL_FOLDERS.filter((folder) => {
    const doc = documents[folder];
    if (filter === "uploaded") return doc;
    if (filter === "missing") return !doc;
    return true;
  });

  const generateQrPayload = (doc) =>
    btoa(
      JSON.stringify({
        documentId: doc._id,
        folder: doc.folder,
        issuer: "DigiBlock",
        version: "v1",
      })
    );

  return (
    <div className="scroll-section">
      <div className="card-scroll">
        {filteredFolders.map((folder, idx) => {
          const doc = documents[folder];
          const color = folderColors[idx % folderColors.length];

          return (
            <div
              key={folder}
              className="modern-card"
              style={{ backgroundColor: color }}
            >
              {/* HEADER */}
              <div className="card-top">
                <span className="doc-name">{folder}</span>
                {doc ? (
                  <span className="verified-badge">Uploaded</span>
                ) : (
                  <span className="missing-badge">Missing</span>
                )}
              </div>

              {doc ? (
                <>
                  {doc.mainDocNumber && (
                    <div className="masked-number">
                      **** **** {doc.mainDocNumber.slice(-4)}
                    </div>
                  )}

                  <div className="secure-line">Secured via Blockchain</div>

                  {/* ==== 4 ACTION BUTTONS ==== */}
                  <div className="card-actions">
                    {/* 1️⃣ VIEW */}
                    <button
                      className="icon-btn"
                      title="View Document"
                      onClick={() => {
                        const url = doc.fileUrl.startsWith("http")
                          ? doc.fileUrl
                          : `${BASE_URL}${doc.fileUrl}`;
                        window.open(url, "_blank");
                      }}
                    >
                      👁
                    </button>

                    {/* 2️⃣ INFO */}
                    <button
                      className="icon-btn"
                      title="Document Info"
                      onClick={() => setInfoDoc(doc)}
                    >
                      ℹ
                    </button>

                    {/* 3️⃣ VERIFY */}
                    <button
                      className="icon-btn"
                      title="Verify on Blockchain"
                      onClick={() => setVerifyDoc(doc)}
                    >
                      ✅
                    </button>

                    {/* 4️⃣ DELETE */}
                    <button
                      className="icon-btn delete"
                      title="Delete Document"
                      onClick={() => onDelete(folder)}
                    >
                      🗑
                    </button>
                  </div>
                </>
              ) : (
                <div className="card-middle empty">No document uploaded</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= INFO MODAL ================= */}
      {infoDoc && (
        <div className="modal-overlay" onClick={() => setInfoDoc(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>📄 Document Info</h3>

            <p><strong>Type:</strong> {infoDoc.folder}</p>

            {infoDoc.mainDocNumber && (
              <p><strong>Number:</strong> {infoDoc.mainDocNumber}</p>
            )}

            {infoDoc.createdAt && (
              <p>
                <strong>Uploaded:</strong>{" "}
                {new Date(infoDoc.createdAt).toLocaleString()}
              </p>
            )}

            <button onClick={() => setInfoDoc(null)}>Close</button>
          </div>
        </div>
      )}

      {/* ================= VERIFY MODAL ================= */}
      {verifyDoc && (
        <div className="modal-overlay" onClick={() => setVerifyDoc(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Blockchain Verification</h3>

            <QRCodeCanvas
              value={generateQrPayload(verifyDoc)}
              size={220}
              level="H"
            />

            <p style={{ marginTop: "8px" }}>
              Scan QR to auto-fill verified form
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  generateQrPayload(verifyDoc)
                );
                alert("QR value copied!");
              }}
            >
              Copy QR
            </button>

            {verifyDoc.txHash && (
              <>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(verifyDoc.txHash);
                    alert("Tx hash copied!");
                  }}
                >
                  Copy Tx Hash
                </button>

                <a
                  href={`https://sepolia.etherscan.io/tx/${verifyDoc.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small-link"
                >
                  View on Etherscan
                </a>
              </>
            )}

            <button onClick={() => setVerifyDoc(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

