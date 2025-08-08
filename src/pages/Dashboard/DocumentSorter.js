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
      const folder = classifyDocument(extractedText);

      if (!folder) {
        setStatus("Could not classify the document.");
        return;
      }

      const newDoc = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result,
        folder,
        uploadedAt: new Date().toISOString(),
      };

     
      

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

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>📥 Upload Document (image)</h3>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {status && <p>Status: {status}</p>}
      {preview && <img src={preview} alt="Preview" width="200" />}
    </div>
  );
}
