import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import './Dashboard.css';

export default function DocumentSorter({ onSorted }) {
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('Reading...');
    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = async () => {
      const result = await Tesseract.recognize(reader.result, 'eng', {
        logger: m => setStatus(m.status),
      });

      const extractedText = result.data.text;
      console.log("OCR Output:", extractedText);

      const folder = classifyDocument(extractedText);

      if (!folder) {
        setStatus("Could not classify the document.");
        return;
      }

      // Extract specific details for the modal
      const details = extractSpecificDetails(folder, extractedText);

      // Create doc object with details included
      const newDoc = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result,
        folder,
        uploadedAt: new Date().toISOString(),
        details, // store extracted info here
      };

      // Send to parent for storage
      onSorted(newDoc);
      setStatus(`Sorted to "${folder}"`);
    };

    reader.readAsDataURL(file);
  };

  const classifyDocument = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("aadhaar") || lower.includes("uidai")) return "Aadhaar";
    if (lower.includes("permanent account number") || lower.includes("pan card")) return "PAN";
    if (lower.includes("passport")) return "Passport";
    if (lower.includes("voter id") || lower.includes("election commission")) return "Voter";
    if (lower.includes("driving license")) return "Driving License";
    if (lower.includes("birth certificate")) return "Birth Certificate";
    if (lower.includes("marksheet") && lower.includes("class 10")) return "10th Marksheet";
    if (lower.includes("marksheet") && lower.includes("class 12")) return "12th Marksheet";
    if (lower.includes("degree certificate")) return "Degree Certificate";
    if (lower.includes("caste certificate")) return "Caste Certificate";
    return null;
  };

  const extractSpecificDetails = (folder, text) => {
    let detail = null;

    if (folder === "Aadhaar") {
      const match = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
      detail = match ? `Aadhaar Number: ${match[0]}` : "Aadhaar number not found.";
    } 
    else if (folder === "PAN") {
      let cleaned = text.replace(/\s+/g, "");
      cleaned = cleaned
        .replace(/0/g, "O")
        .replace(/1/g, "I")
        .replace(/8/g, "B");
      const match = cleaned.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
      detail = match ? `PAN Number: ${match[0]}` : "PAN number not found.";
    }
    else if (folder === "Passport") {
      const match = text.match(/\b[A-Z][0-9]{7}\b/);
      detail = match ? `Passport Number: ${match[0]}` : "Passport number not found.";
    }
    else if (folder === "Voter") {
      const match = text.match(/\b[A-Z]{3}[0-9]{7}\b/);
      detail = match ? `Voter ID: ${match[0]}` : "Voter ID not found.";
    }
    else {
      detail = "Specific detail extraction not configured for this document type.";
    }

    return detail;
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>📥 Upload Document (image)</h3>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {status && <p>Status: {status}</p>}
      {preview && <img src={preview} alt="Preview" width="200" />}
    </div>
  );
}
