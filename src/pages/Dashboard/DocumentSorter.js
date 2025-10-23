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

        // Extract main document number for MongoDB
        let mainDocNumber = "";
        switch (folder) {
          case "Aadhaar":
            const aadhaarMatch = details.match(/\d{4}\s\d{4}\s\d{4}/);
            mainDocNumber = aadhaarMatch ? aadhaarMatch[0] : "";
            break;
          case "PAN":
            const panMatch = details.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
            mainDocNumber = panMatch ? panMatch[0] : "";
            break;
          case "Passport":
            const passportMatch = details.match(/\b[A-Z][0-9]{7}\b/);
            mainDocNumber = passportMatch ? passportMatch[0] : "";
            break;
          case "Voter":
            const voterMatch = details.match(/\b[A-Z]{3}[0-9]{7}\b/);
            mainDocNumber = voterMatch ? voterMatch[0] : "";
            break;
          case "Driving License":
            const dlMatch = details.match(/\b([A-Z]{2}\d{2}\s?\d{11}|\d{2}[A-Z]{2}\d{11})\b/i);
            mainDocNumber = dlMatch ? dlMatch[0] : "";
            break;
          case "10th Marksheet":
            const roll10 = details.match(/\b\d{4,10}\b/);
            mainDocNumber = roll10 ? roll10[0] : "";
            break;
          case "12th Marksheet":
            const roll12 = details.match(/\b\d{4,10}\b/);
            mainDocNumber = roll12 ? roll12[0] : "";
            break;
          case "Degree Certificate":
            const degreeMatch = details.match(/\b([A-Z]{2,5}\d{2,6})\b/);
            mainDocNumber = degreeMatch ? degreeMatch[0] : "";
            break;
          case "Caste Certificate":
            const casteMatch = details.match(/\b[A-Z0-9]{3,10}\b/);
            mainDocNumber = casteMatch ? casteMatch[0] : "";
            break;
          default:
            mainDocNumber = "";
        }

        // Prepare formData
        const formData = new FormData();
        formData.append('document', file);
        formData.append('folder', folder);
        formData.append('extractedData', text);
        formData.append('extractedDetails', details);
        formData.append('mainDocNumber', mainDocNumber); // <-- store only number in Mongo

        setStatus('Uploading to decentralized storage...');
        const res = await authAxios.post('/api/documents/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const uploadedDoc = res.data.document;
        const cidUrl = res.data.cidUrl;
        const txHash = res.data.txHash || null;

        onSorted({ ...uploadedDoc, details, cidUrl, txHash, mainDocNumber });
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
    const normalized = lower.replace(/[^\w\s]|_/g, " ").replace(/\s+/g, " ").trim();

    if (/(aadhaar|uidai)/.test(normalized)) return "Aadhaar";
    if (/(permanent account number|pan card|pan)/.test(normalized)) return "PAN";
    if (/(passport)/.test(normalized)) return "Passport";
    if (/(voter id|voter|voting|voterid|election commission|election|electoral card)/.test(normalized)) return "Voter";
    if (/(driving license|driving|driving licence|driver|driver licence|driving[- ]?lic|dl)/.test(normalized)) return "Driving License";
    if (/(birth|birth certificate|dob certificate|date of birth)/.test(normalized)) return "Birth Certificate";
    if (/(marksheet|mark sheet)/.test(normalized) && /(class 10|10th|tenth|ssc|secondary)/.test(normalized)) return "10th Marksheet";
    if (/(marksheet|mark sheet)/.test(normalized) && /(class 12|12th|twelfth|hsc|higher secondary)/.test(normalized)) return "12th Marksheet";
    if (/(degree certificate|graduation|bachelor|master|diploma)/.test(normalized)) return "Degree Certificate";
    if (/(caste certificate|category certificate|sc|st|obc)/.test(normalized)) return "Caste Certificate";

    return null;
  };

  const extractSpecificDetails = (folder, text) => {
    const cleanText = text.replace(/\s+/g, " ").trim();

    switch (folder) {
      case "Aadhaar":
        const aadhaar = cleanText.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
        return aadhaar ? `Aadhaar Number: ${aadhaar[0]}` : "Aadhaar number not found.";
      case "PAN":
        const panText = cleanText.replace(/\s+/g, "").replace(/0/g, "O").replace(/1/g, "I").replace(/8/g, "B");
        const pan = panText.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        return pan ? `PAN Number: ${pan[0]}` : "PAN number not found.";
      case "Passport":
        const passport = cleanText.match(/\b[A-Z][0-9]{7}\b/);
        return passport ? `Passport Number: ${passport[0]}` : "Passport number not found.";
      case "Voter":
        const voter = cleanText.match(/\b[A-Z]{3}[0-9]{7}\b/);
        return voter ? `Voter ID: ${voter[0]}` : "Voter ID not found.";
      case "Driving License":
        const dl = cleanText.match(/\b([A-Z]{2}\d{2}\s?\d{11}|\d{2}[A-Z]{2}\d{11})\b/i);
        return dl ? `Driving License No: ${dl[0]}` : "Driving License number not found.";
      case "Birth Certificate":
        const dob = cleanText.match(/\b\d{2}[-/]\d{2}[-/]\d{4}\b/);
        return dob ? `Date of Birth: ${dob[0]}` : "DOB not found.";
      case "10th Marksheet":
        const roll10 = cleanText.match(/\b\d{4,10}\b/);
        return roll10 ? `10th Roll No: ${roll10[0]}` : "10th Roll No not found.";
      case "12th Marksheet":
        const roll12 = cleanText.match(/\b\d{4,10}\b/);
        return roll12 ? `12th Roll No: ${roll12[0]}` : "12th Roll No not found.";
      case "Degree Certificate":
        const degree = cleanText.match(/\b([A-Z]{2,5}\d{2,6})\b/);
        return degree ? `Degree No: ${degree[0]}` : "Degree number not found.";
      case "Caste Certificate":
        const casteId = cleanText.match(/\b[A-Z0-9]{3,10}\b/);
        return casteId ? `Caste Certificate ID: ${casteId[0]}` : "Caste Certificate ID not found.";
      default:
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
