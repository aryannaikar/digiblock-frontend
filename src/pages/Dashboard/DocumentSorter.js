import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

export default function DocumentSorter({ onSorted }) {

  const { user, authAxios } = useAuth();

  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  /* ================= OPEN FILE PICKER ================= */

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /* ================= PROCESS FILE ================= */

  const processFile = async (file) => {

    if (!file) return;

    if (!user) {
      setStatus("Please login before uploading.");
      return;
    }

    setStatus("Reading document...");
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);

    const reader = new FileReader();

    reader.onload = async () => {
      try {

        /* ===== OCR ===== */
        const result = await Tesseract.recognize(reader.result, "eng", {
          logger: m => setStatus(m.status)
        });

        const text = result.data.text;

        const folder = classifyDocument(text);

        if (!folder) {
          setStatus("Could not recognize this document type.");
          return;
        }

        const details = extractSpecificDetails(folder, text);

        let mainDocNumber = "";
        const match = details.match(/[A-Z0-9]{6,20}|\d{4}\s\d{4}\s\d{4}/);
        if (match) mainDocNumber = match[0];

        /* ===== UPLOAD ===== */
        const formData = new FormData();
        formData.append("document", file);
        formData.append("folder", folder);
        formData.append("extractedData", text);
        formData.append("extractedDetails", details);
        formData.append("mainDocNumber", mainDocNumber);

        setStatus("Uploading securely to decentralized storage...");

        const res = await authAxios.post("/api/documents/add", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const uploadedDoc = res.data.document;

        onSorted({
          ...uploadedDoc,
          details,
          cidUrl: res.data.cidUrl,
          txHash: res.data.txHash,
          mainDocNumber
        });

        setStatus(`${folder} uploaded & secured on blockchain ✔`);

      } catch (err) {
        console.error(err);
        setStatus("Upload failed.");
      }
    };

    reader.readAsDataURL(file);
  };

  /* ================= INPUT CHANGE ================= */

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  /* ================= DRAG EVENTS ================= */

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  /* ================= DOCUMENT CLASSIFIER ================= */

  const classifyDocument = (text) => {
    const t = text.toLowerCase();

    if (t.includes("aadhaar") || t.includes("uidai")) return "Aadhaar";
    if (t.includes("permanent account number") || t.includes("pan")) return "PAN";
    if (t.includes("passport")) return "Passport";
    if (t.includes("voter")) return "Voter";
    if (t.includes("driving")) return "Driving License";
    if (t.includes("birth")) return "Birth Certificate";
    if (t.includes("10th") || t.includes("ssc")) return "10th Marksheet";
    if (t.includes("12th") || t.includes("hsc")) return "12th Marksheet";
    if (t.includes("degree") || t.includes("bachelor")) return "Degree Certificate";
    if (t.includes("caste")) return "Caste Certificate";

    return null;
  };

  /* ================= DETAIL EXTRACTOR ================= */

  const extractSpecificDetails = (folder, text) => {

    const clean = text.replace(/\s+/g, " ");

    switch (folder) {
      case "Aadhaar":
        return clean.match(/\d{4}\s\d{4}\s\d{4}/)?.[0] || "";
      case "PAN":
        return clean.match(/[A-Z]{5}[0-9]{4}[A-Z]/)?.[0] || "";
      case "Passport":
        return clean.match(/[A-Z][0-9]{7}/)?.[0] || "";
      case "Voter":
        return clean.match(/[A-Z]{3}[0-9]{7}/)?.[0] || "";
      default:
        return "";
    }
  };

  /* ================= UI ================= */

  return (
    <div className="upload-section">

      <h3 className="upload-title">Upload Document</h3>

      <div
        className={`dropzone ${dragActive ? "drag-active" : ""}`}
        onClick={openFilePicker}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <div className="drop-content">
          <div className="upload-icon">📄</div>
          <p className="main-text">Drag & Drop or Click to Upload</p>
          <span className="sub-text">JPG • PNG • PDF supported</span>
          <div className="security-line">🔒 Encrypted before upload</div>
        </div>

      </div>

      {status && <p className="status">{status}</p>}
      {preview && <img src={preview} alt="preview" className="preview" />}

    </div>
  );
}
