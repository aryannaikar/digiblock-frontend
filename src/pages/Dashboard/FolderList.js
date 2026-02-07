import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./Dashboard.css";

/* ================= DOCUMENT TYPES ================= */

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

export default function FolderList({ documents, onDelete }) {

  const scrollRef = useRef(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [qrDoc, setQrDoc] = useState(null);

  const BASE_URL = "http://localhost:5000";

  /* ================= SCROLL ================= */

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

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

  /* ================= MASK NUMBER ================= */

  const maskNumber = (num) => {
    if (!num) return "Number hidden";
    return "**** **** " + num.slice(-4);
  };

  return (
    <div className="scroll-section">

      <button className="scroll-btn left" onClick={() => scroll("left")}>
        &#8592;
      </button>

      <div className="card-scroll" ref={scrollRef}>

        {ALL_FOLDERS.map((folder, idx) => {

          const doc = documents[folder];
          const color = folderColors[idx % folderColors.length];

          return (
            <div key={folder} className="card modern-card" style={{ backgroundColor: color }}>

              {/* ===== TOP ===== */}
              <div className="card-top">
                <h4 className="doc-name">{folder}</h4>

                {doc ? (
                  <span className="verified-badge">✔ Verified</span>
                ) : (
                  <span className="missing-badge">Not Uploaded</span>
                )}
              </div>

              {/* ===== MIDDLE ===== */}
              {doc ? (
                <div className="card-middle">
                  <p className="masked-number">{maskNumber(doc.mainDocNumber)}</p>
                  <p className="secure-line">🔐 Secured on Blockchain</p>
                </div>
              ) : (
                <div className="card-middle empty">
                  <p>No document uploaded yet</p>
                  <span>Upload to enable verification</span>
                </div>
              )}

              {/* ===== ACTIONS ===== */}
              {doc && (
                <div className="card-actions">

                  {/* View */}
                  <button
                    className="primary-btn"
                    onClick={() => {
                      const url = doc.fileUrl.startsWith("http")
                        ? doc.fileUrl
                        : `${BASE_URL}${doc.fileUrl}`;
                      window.open(url, "_blank");
                    }}
                  >
                    View
                  </button>

                  {/* Details */}
                  <button className="icon-btn" onClick={() => setSelectedDoc(doc)}>
                    ℹ
                  </button>

                  {/* QR */}
                  <button className="icon-btn" onClick={() => setQrDoc(doc)}>
                    QR
                  </button>

                  {/* Delete */}
                  <button className="icon-btn delete" onClick={() => onDelete(folder)}>
                    🗑
                  </button>

                </div>
              )}

            </div>
          );
        })}
      </div>

      <button className="scroll-btn right" onClick={() => scroll("right")}>
        &#8594;
      </button>

      {/* ================= QR MODAL ================= */}

      {qrDoc && (
        <div className="modal-overlay" onClick={() => setQrDoc(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h3>Verified Smart QR</h3>

            {(() => {
              const payload = generateQrPayload(qrDoc);

              return (
                <>
                  <QRCodeCanvas value={payload} size={260} level="H" />

                  <p style={{ marginTop: "10px" }}>
                    Scan this QR to auto-fill verified document details
                  </p>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(payload);
                      alert("QR value copied!");
                    }}
                  >
                    📋 Copy QR Value
                  </button>

                  <button onClick={() => setQrDoc(null)}>Close</button>
                </>
              );
            })()}

          </div>
        </div>
      )}

      {/* ================= DETAILS MODAL ================= */}

      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h3>Document Verification Details</h3>

            <p><strong>Document:</strong> {selectedDoc.folder}</p>

            {selectedDoc.mainDocNumber && (
              <p><strong>Number:</strong> {selectedDoc.mainDocNumber}</p>
            )}

            <p>
              <strong>Uploaded:</strong>{" "}
              {new Date(selectedDoc.uploadedAt).toLocaleString()}
            </p>

            <hr style={{ margin: "15px 0" }} />

            <h4>🔐 Blockchain Proof</h4>

            {/* ===== TX HASH ===== */}
            {selectedDoc.txHash && (
              <div className="verify-box">

                <label>Transaction Hash</label>

                <textarea
                  readOnly
                  value={selectedDoc.txHash}
                  className="hash-box"
                />

                <div className="verify-actions">

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDoc.txHash);
                      alert("Transaction hash copied!");
                    }}
                  >
                    📋 Copy Tx Hash
                  </button>

                  <button
                    onClick={() =>
                      window.open(
                        `https://sepolia.etherscan.io/tx/${selectedDoc.txHash}`,
                        "_blank"
                      )
                    }
                  >
                    🔎 View on Etherscan
                  </button>

                </div>
              </div>
            )}

            {/* ===== CID ===== */}
            {selectedDoc.cidUrl && (
              <div className="verify-box">

                <label>IPFS File (CID)</label>

                <textarea
                  readOnly
                  value={selectedDoc.cidUrl}
                  className="hash-box"
                />

                <div className="verify-actions">

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDoc.cidUrl);
                      alert("CID copied!");
                    }}
                  >
                    📋 Copy CID
                  </button>

                  <button
                    onClick={() => window.open(selectedDoc.cidUrl, "_blank")}
                  >
                    🌐 Open on IPFS
                  </button>

                </div>
              </div>
            )}

            {/* OCR TEXT */}
            {selectedDoc.extractedData && (
              <>
                <hr style={{ margin: "15px 0" }} />
                <p><strong>Extracted OCR Text:</strong></p>
                <textarea
                  readOnly
                  value={selectedDoc.extractedData}
                  style={{ width: "100%", height: "120px" }}
                />
              </>
            )}

            <button onClick={() => setSelectedDoc(null)}>Close</button>

          </div>
        </div>
      )}

    </div>
  );
}
