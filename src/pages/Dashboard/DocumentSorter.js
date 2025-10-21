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
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);

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

        // Prepare formData
        const formData = new FormData();
        formData.append('document', file);
        formData.append('folder', folder);
        formData.append('extractedData', text);
        formData.append('extractedDetails', details);

        setStatus('Uploading to decentralized storage...');
        const res = await authAxios.post('/api/documents/add', formData, { // ✅ updated route
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const uploadedDoc = res.data.document;
        const cidUrl = res.data.cidUrl;
        const txHash = res.data.txHash || null;

        onSorted({ ...uploadedDoc, details, cidUrl, txHash });
        setStatus(`Uploaded "${folder}" successfully!\nIPFS: ${cidUrl}${txHash ? `\nBlockchain Tx: ${txHash}` : ''}`);
      } catch (err) {
        console.error(err);
        setStatus('Upload failed.');
      }
    };

    reader.readAsDataURL(file);
  };

  const classifyDocument = (text) => {
    const lower = text.toLowerCase();
    
    // Normalize the text: remove extra spaces, special characters, and standardize
    const normalized = lower.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " ").trim();
    
    // Aadhaar
    if (/(aadhaar|uidai)/.test(normalized)) return "Aadhaar";
    
    // PAN
    if (/(permanent account number|pan card|pan)/.test(normalized)) return "PAN";
    
    // Passport
    if (/(passport)/.test(normalized)) return "Passport";
    
    // Voter ID
    if (/(voter id|voterid|election commission|electoral card)/.test(normalized)) return "Voter";
    
    // Driving License - Improved matching
    if (/(driving license|driving licence|driver license|driver licence|driving[- ]?lic|dl)/.test(normalized)) return "Driving License";
    
    // Birth Certificate
    if (/(birth certificate|dob certificate|date of birth)/.test(normalized)) return "Birth Certificate";
    
    // 10th Marksheet
    if (/(marksheet|mark sheet)/.test(normalized) && /(class 10|10th|tenth|ssc|secondary)/.test(normalized)) return "10th Marksheet";
    
    // 12th Marksheet
    if (/(marksheet|mark sheet)/.test(normalized) && /(class 12|12th|twelfth|hsc|higher secondary)/.test(normalized)) return "12th Marksheet";
    
    // Degree Certificate
    if (/(degree certificate|graduation|bachelor|master|diploma)/.test(normalized)) return "Degree Certificate";
    
    // Caste Certificate
    if (/(caste certificate|category certificate|sc|st|obc)/.test(normalized)) return "Caste Certificate";
    
    return null;
};

// Test cases for driving license
console.log(classifyDocument("driving license")); // ✅ "Driving License"
console.log(classifyDocument("driving licence")); // ✅ "Driving License" 
console.log(classifyDocument("driver license")); // ✅ "Driving License"
console.log(classifyDocument("driving-license")); // ✅ "Driving License"
console.log(classifyDocument("DL document")); // ✅ "Driving License"
console.log(classifyDocument("Driving License Card")); // ✅ "Driving License"
console.log(classifyDocument("Driver's License")); // ✅ "Driving License"

  const extractSpecificDetails = (folder, text) => {
    if (folder === "Aadhaar") {
      const match = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
      return match ? `Aadhaar Number: ${match[0]}` : "Aadhaar number not found.";
    } else if (folder === "PAN") {
      const cleaned = text.replace(/\s+/g, "").replace(/0/g,"O").replace(/1/g,"I").replace(/8/g,"B");
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
      <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} />
      {status && <p style={{ whiteSpace: 'pre-wrap' }}>Status: {status}</p>}
      {preview && <img src={preview} alt="Preview" width="200" />}
    </div>
  );
}
