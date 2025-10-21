import React, { useRef, useState } from 'react';
import './Dashboard.css';

const ALL_FOLDERS = [
  "Aadhaar", "PAN", "Passport", "Voter", "Driving License",
  "Birth Certificate", "10th Marksheet", "12th Marksheet",
  "Degree Certificate", "Caste Certificate"
];

const folderColors = [
  "#6A1B9A", "#1565C0", "#512DA8", "#0277BD", "#880E4F",
  "#283593", "#2E7D32", "#FF6F00", "#5D4037", "#455A64"
];

export default function FolderList({ documents, onDelete }) {
  const scrollRef = useRef(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -250 : 250,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="scroll-section">
      <button className="scroll-btn left" onClick={() => scroll('left')}>&#8592;</button>

      <div className="card-scroll" ref={scrollRef}>
        {ALL_FOLDERS.map((folder, idx) => {
          const doc = documents[folder];
          const color = folderColors[idx % folderColors.length];

          return (
            <div key={folder} className="card" style={{ backgroundColor: color }}>
              <h4>{folder}</h4>

              {doc ? (
                <>
                  <p><strong>{doc.name}</strong></p>
                  <p className="extracted-info">{doc.extractedDetails || "No details extracted"}</p>

                  {/* IPFS Link */}
                  {doc.cidUrl && (
                    <p>
                      <strong>IPFS:</strong>{" "}
                      <a href={doc.cidUrl.replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noopener noreferrer">
                        {doc.cidUrl.split("/").pop()}
                      </a>
                    </p>
                  )}

                  {/* Blockchain Tx Hash */}
                  {doc.txHash && (
                    <p>
                      <strong>Blockchain Tx:</strong>{" "}
                      <a href={`https://sepolia.etherscan.io/tx/${doc.txHash}`} target="_blank" rel="noopener noreferrer">
                        {doc.txHash.substring(0, 10)}...
                      </a>
                    </p>
                  )}

                  <button onClick={() => window.open(doc.cidUrl?.replace("ipfs://", "https://ipfs.io/ipfs/"), '_blank')}>View Document</button>
                  <button onClick={() => setSelectedDoc(doc)}>Details</button>
                  <button onClick={() => onDelete(folder)} className="delete-btn">🗑 Delete</button>
                </>
              ) : (
                <>
                  <p className='no-doc'>No document uploaded</p>
                  <button disabled className="disabled-btn">View</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button className="scroll-btn right" onClick={() => scroll('right')}>&#8594;</button>

      {/* Modal for detailed view */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Document Details</h3>
            <p><strong>Name:</strong> {selectedDoc.name}</p>
            <p><strong>Type:</strong> {selectedDoc.type}</p>
            <p><strong>Uploaded:</strong> {new Date(selectedDoc.uploadedAt).toLocaleString()}</p>
            <p><strong>Extracted Details:</strong> {selectedDoc.extractedDetails || "No details available"}</p>

            {/* Full OCR Text */}
            {selectedDoc.extractedData && (
              <div>
                <p><strong>Full OCR Text:</strong></p>
                <textarea 
                  readOnly 
                  value={selectedDoc.extractedData} 
                  style={{width: '100%', height: '100px', marginTop: '10px'}}
                />
              </div>
            )}

            {/* IPFS CID */}
            {selectedDoc.cidUrl && (
              <p>
                <strong>IPFS CID:</strong>{" "}
                <a href={selectedDoc.cidUrl.replace("ipfs://", "https://ipfs.io/ipfs/")} target="_blank" rel="noopener noreferrer">
                  {selectedDoc.cidUrl.split("/").pop()}
                </a>
              </p>
            )}

            {/* Blockchain Transaction */}
            {selectedDoc.txHash && (
              <p>
                <strong>Blockchain Tx:</strong>{" "}
                <a href={`https://sepolia.etherscan.io/tx/${selectedDoc.txHash}`} target="_blank" rel="noopener noreferrer">
                  {selectedDoc.txHash}
                </a>
              </p>
            )}

            <button onClick={() => setSelectedDoc(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
