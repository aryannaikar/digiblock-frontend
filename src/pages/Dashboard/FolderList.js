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

  const [qrDoc, setQrDoc] = useState(null);

  const BASE_URL = "http://localhost:5000";

  /* ================= FILTER LOGIC ================= */

  const filteredFolders = ALL_FOLDERS.filter(folder => {
    const doc = documents[folder];

    if (filter === "uploaded") return doc;
    if (filter === "missing") return !doc;

    return true;
  });

  /* ================= QR PAYLOAD ================= */

  const generateQrPayload = (doc) => {
    return btoa(
      JSON.stringify({
        documentId: doc._id,
        folder: doc.folder,
        issuer: "DigiBlock",
        version: "v1",
      })
    );
  };

  return (
    <div className="scroll-section">

      <div className="card-scroll">

        {filteredFolders.map((folder, idx) => {

          const doc = documents[folder];
          const color = folderColors[idx % folderColors.length];

          return (
            <div key={folder} className="modern-card" style={{ backgroundColor: color }}>

              {/* HEADER */}
              <div className="card-top">
                <span className="doc-name">{folder}</span>

                {doc ? (
                  <span className="verified-badge">Uploaded</span>
                ) : (
                  <span className="missing-badge">Missing</span>
                )}
              </div>

              {/* CONTENT */}
              {doc ? (
                <>
                  {doc.mainDocNumber && (
                    <div className="masked-number">
                      **** **** {doc.mainDocNumber.slice(-4)}
                    </div>
                  )}

                  <div className="secure-line">
                    Secured via Blockchain
                  </div>

                  {/* ACTIONS */}
                  <div className="card-actions">

                    {/* VIEW DOCUMENT */}
                    <button
                      className="primary-btn"
                      onClick={() => {
                        const viewUrl = doc.fileUrl.startsWith("http")
                          ? doc.fileUrl
                          : `${BASE_URL}${doc.fileUrl}`;
                        window.open(viewUrl, "_blank");
                      }}
                    >
                      View
                    </button>

                    {/* QR */}
                    <button
                      className="icon-btn"
                      onClick={() => setQrDoc(doc)}
                    >
                      QR
                    </button>

                    {/* DELETE */}
                    <button
                      className="icon-btn delete"
                      onClick={() => onDelete(folder)}
                    >
                      🗑
                    </button>

                  </div>
                </>
              ) : (
                <div className="card-middle empty">
                  No document uploaded
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* ================= QR MODAL ================= */}

      {qrDoc && (
        <div className="modal-overlay" onClick={() => setQrDoc(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h3>Smart Form QR</h3>

            {(() => {
              const payload = generateQrPayload(qrDoc);

              return (
                <>
                  <QRCodeCanvas value={payload} size={250} level="H" />

                  <p style={{ marginTop: "10px" }}>
                    Scan this QR to auto-fill verified form
                  </p>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(payload);
                      alert("QR value copied!");
                    }}
                  >
                    Copy QR Value
                  </button>

                  <button onClick={() => setQrDoc(null)}>Close</button>
                </>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}
