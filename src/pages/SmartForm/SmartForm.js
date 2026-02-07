import React, { useState } from "react";
import "./SmartForm.css";

export default function SmartForm() {
  const [requestedFields, setRequestedFields] = useState([]);
  const [qrValue, setQrValue] = useState("");
  const [decodedData, setDecodedData] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Toggle requested fields
  const toggleField = (field) => {
    setRequestedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  // Decode and validate QR
  const verifyQR = () => {
    try {
      if (!qrValue || qrValue.length < 10) {
        throw new Error("Invalid QR");
      }

      const decoded = JSON.parse(atob(qrValue));

      if (!decoded.documentId || decoded.issuer !== "DigiBlock") {
        throw new Error("Invalid issuer");
      }

      // 🔐 Mock verified data (later from backend)
      setDecodedData({
        aadhaar: "XXXX-XXXX-1234",
        pan: "ABCDE1234F",
        passport: "M1234567",
        voter: "ABC1234567",
        documentId: decoded.documentId,
      });

      setError("");
    } catch {
      setDecodedData(null);
      setConsent(false);
      setError("❌ Invalid or tampered QR value");
    }
  };

  const resetForm = () => {
    setRequestedFields([]);
    setQrValue("");
    setDecodedData(null);
    setConsent(false);
    setSubmitted(false);
    setError("");
  };

  return (
    <div className="smartform-container">
      <h2>📄 DigiBlock Smart Form</h2>

      {/* STEP 1: REQUEST DETAILS */}
      {!decodedData && (
        <div className="card">
          <h3>Select Required Details</h3>

          <label>
            <input
              type="checkbox"
              checked={requestedFields.includes("aadhaar")}
              onChange={() => toggleField("aadhaar")}
            />
            Aadhaar Number
          </label>

          <label>
            <input
              type="checkbox"
              checked={requestedFields.includes("pan")}
              onChange={() => toggleField("pan")}
            />
            PAN Number
          </label>

          <label>
            <input
              type="checkbox"
              checked={requestedFields.includes("passport")}
              onChange={() => toggleField("passport")}
            />
            Passport Number
          </label>

          <label>
            <input
              type="checkbox"
              checked={requestedFields.includes("voter")}
              onChange={() => toggleField("voter")}
            />
            Voter ID
          </label>

          {requestedFields.length > 0 && (
            <>
              <h4 style={{ marginTop: "15px" }}>Paste Smart Form QR</h4>

              <textarea
                placeholder="Paste QR value here"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
              />

              {error && <p className="error">{error}</p>}

              <button onClick={verifyQR}>Verify QR</button>
            </>
          )}
        </div>
      )}

      {/* STEP 2: CONSENT */}
      {decodedData && !consent && (
        <div className="card">
          <h3>Consent Required</h3>
          <p>The following verified details will be shared:</p>

          <ul>
            {requestedFields.map((f) => (
              <li key={f}>✔ {f.toUpperCase()}</li>
            ))}
          </ul>

          <button onClick={() => setConsent(true)}>Allow</button>
          <button className="secondary" onClick={resetForm}>
            Deny
          </button>
        </div>
      )}

      {/* STEP 3: AUTO-FILLED FORM */}
      {consent && !submitted && (
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <h3>Auto-Filled Verified Form</h3>

          {requestedFields.includes("aadhaar") && (
            <>
              <label>Aadhaar Number</label>
              <input value={decodedData.aadhaar} readOnly />
            </>
          )}

          {requestedFields.includes("pan") && (
            <>
              <label>PAN Number</label>
              <input value={decodedData.pan} readOnly />
            </>
          )}

          {requestedFields.includes("passport") && (
            <>
              <label>Passport Number</label>
              <input value={decodedData.passport} readOnly />
            </>
          )}

          {requestedFields.includes("voter") && (
            <>
              <label>Voter ID</label>
              <input value={decodedData.voter} readOnly />
            </>
          )}

          <p className="verified">✔ Verified via Blockchain</p>

          <button type="submit">Submit</button>
        </form>
      )}

      {/* STEP 4: SUCCESS */}
      {submitted && (
        <div className="card success">
          <h3>✅ Form Submitted</h3>
          <p>Only verified details were shared.</p>
          <button onClick={resetForm}>Submit Another</button>
        </div>
      )}
    </div>
  );
}
``