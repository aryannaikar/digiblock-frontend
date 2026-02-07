import React, { useRef, useState } from "react";
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

export default function FolderList({ documents, onDelete }) {
  const scrollRef = useRef(null);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [qrDoc, setQrDoc] = useState(null);

  const BASE_URL = "http://localhost:5000";

  // horizontal scroll
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -250 : 250,
        behavior: "smooth",
      });
    }
  };

  // 🔐 Smart Form QR payload
  const generateQrPayload = (doc) => {
    return btoa(
      JSON.stringify({
        documentId: doc._id,
        folder: doc.folder,
        issuer: "DigiBlock",
        version: "v0",
      })
    );
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
            <div key={folder} className="card" style={{ backgroundColor: color }}>
              <h4>{folder}</h4>

              {doc ? (
                <>
                  {/* Uploaded Badge */}
                  <div className="upload-badge">✓ Uploaded</div>

                  <p style={{ marginTop: "15px", fontWeight: "bold" }}>
                    Verified Document Stored
                  </p>

                  {/* View */}
                  <button
                    onClick={() => {
                      const viewUrl = doc.fileUrl.startsWith("http")
                        ? doc.fileUrl
                        : `${BASE_URL}${doc.fileUrl}`;
                      window.open(viewUrl, "_blank");
                    }}
                  >
                    View Document
                  </button>

                  {/* Details */}
                  <button onClick={() => setSelectedDoc(doc)}>
                    Details
                  </button>

                  {/* QR */}
                  <button onClick={() => setQrDoc(doc)}>
                    📄 Smart Form QR
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete(folder)}
                    className="delete-btn"
                  >
                    🗑 Delete
                  </button>
                </>
              ) : (
                <>
                  <p className="no-doc">No document uploaded</p>
                  <button disabled className="disabled-btn">View</button>
                </>
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
            <h3>Smart Form QR</h3>

            {(() => {
              const payload = generateQrPayload(qrDoc);

              return (
                <>
                  <QRCodeCanvas value={payload} size={280} level="H" />

                  <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                    Scan or copy this QR value to auto-fill verified form fields
                  </p>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(payload);
                      alert("QR value copied!");
                    }}
                  >
                    📋 Copy QR Value
                  </button>

                  <p
                    style={{
                      fontSize: "0.75rem",
                      marginTop: "8px",
                      wordBreak: "break-all",
                    }}
                  >
                    {payload.substring(0, 60)}...
                  </p>

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
            <h3>Document Details</h3>

            <p>
              <strong>Name:</strong> {selectedDoc.name}
            </p>

            {selectedDoc.mainDocNumber && (
              <p>
                <strong>Number:</strong> {selectedDoc.mainDocNumber}
              </p>
            )}

            <p>
              <strong>Uploaded:</strong>{" "}
              {new Date(selectedDoc.uploadedAt).toLocaleString()}
            </p>

            {/* BLOCKCHAIN SECTION */}
            <hr style={{ margin: "15px 0" }} />
            <h4>🔐 Blockchain Verification</h4>

            {/* TX HASH */}
            {selectedDoc.txHash && (
              <div className="verify-box">
                <label>Transaction Hash:</label>

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

            {/* CID */}
            {selectedDoc.cid && (
              <div className="verify-box">
                <label>IPFS CID:</label>

                <textarea
                  readOnly
                  value={selectedDoc.cid}
                  className="hash-box"
                />

                <div className="verify-actions">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDoc.cid);
                      alert("CID copied!");
                    }}
                  >
                    📋 Copy CID
                  </button>

                  <button
                    onClick={() =>
                      window.open(`https://ipfs.io/ipfs/${selectedDoc.cid}`, "_blank")
                    }
                  >
                    🌐 Open on IPFS
                  </button>
                </div>
              </div>
            )}

            {/* OCR */}
            {selectedDoc.extractedData && (
              <>
                <hr style={{ margin: "15px 0" }} />
                <p>
                  <strong>Full OCR Text:</strong>
                </p>
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
