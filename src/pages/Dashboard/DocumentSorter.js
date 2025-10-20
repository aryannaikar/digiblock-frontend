import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function DocumentSorter({ onSorted }) {
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState(null);
  const { user, authAxios } = useAuth();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) {
      setStatus('Please log in before uploading.');
      return;
    }

    setStatus('Reading document...');
    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await Tesseract.recognize(reader.result, 'eng', {
          logger: m => setStatus(m.status)
        });

        const text = result.data.text;
        const folder = classifyDocument(text);
        if (!folder) {
          setStatus('Could not classify this document.');
          return;
        }

        const details = extractSpecificDetails(folder, text);

        // Upload file to backend
        const formData = new FormData();
        formData.append('document', file);
        formData.append('folder', folder);
        formData.append('extractedData', text); // Full OCR text
        formData.append('extractedDetails', details); // Specific extracted details

        const res = await authAxios.post('/api/upload/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        onSorted({ ...res.data.document, details });
        setStatus(`Uploaded and sorted to "${folder}"`);
      } catch (err) {
        console.error(err);
        setStatus('Upload failed.');
      }
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
    if (folder === "Aadhaar") {
      const match = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
      return match ? `Aadhaar Number: ${match[0]}` : "Aadhaar number not found.";
    } else if (folder === "PAN") {
      let cleaned = text.replace(/\s+/g, "").replace(/0/g,"O").replace(/1/g,"I").replace(/8/g,"B");
      const match = cleaned.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
      return match ? `PAN Number: ${match[0]}` : "PAN number not found.";
    } else if (folder === "Passport") {
      const match = text.match(/\b[A-Z][0-9]{7}\b/);
      return match ? `Passport Number: ${match[0]}` : "Passport number not found.";
    } else if (folder === "Voter") {
      const match = text.match(/\b[A-Z]{3}[0-9]{7}\b/);
      return match ? `Voter ID: ${match[0]}` : "Voter ID not found.";
    } else {
      return "Detail extraction not configured for this type.";
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>📥 Upload Document</h3>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {status && <p>Status: {status}</p>}
      {preview && <img src={preview} alt="Preview" width="200" />}
    </div>
  );
}
