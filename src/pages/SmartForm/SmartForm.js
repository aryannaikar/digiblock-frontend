import React, { useState } from "react";
import "./SmartForm.css";

export default function SmartForm() {
  const [requestedFields, setRequestedFields] = useState([]);
  const [qrValue, setQrValue] = useState("");
  const [decodedData, setDecodedData] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleField = (field) => {
    setRequestedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const verifyQR = () => {
    try {
      if (!qrValue || qrValue.length < 10) {
        throw new Error("Invalid QR");
      }

      const decoded = JSON.parse(atob(qrValue));

      if (!decoded.documentId || decoded.issuer !== "DigiBlock") {
        throw new Error("Invalid issuer");
      }

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

      {/* STEP 1 */}
      {!decodedData && (
        <div className="card">
          <h3>Select Required Details</h3>

          {["aadhaar", "pan", "passport", "voter"].map((field) => (
            <label key={field}>
              <input
                type="checkbox"
                checked={requestedFields.includes(field)}
                onChange={() => toggleField(field)}
              />
              {field.toUpperCase()}
            </label>
          ))}

          {requestedFields.length > 0 && (
            <div>
              <h4 style={{ marginTop: "15px" }}>Paste Smart Form QR</h4>

              <textarea
                placeholder="Paste QR value here"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
              />

              {error && <p className="error">{error}</p>}

              <button onClick={verifyQR}>Verify QR</button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 */}
      {decodedData && !consent && (
        <div className="card">
          <h3>Consent Required</h3>

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

      {/* STEP 3 */}
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
            <div>
              <label>Aadhaar Number</label>
              <input value={decodedData.aadhaar} readOnly />
            </div>
          )}

          {requestedFields.includes("pan") && (
            <div>
              <label>PAN Number</label>
              <input value={decodedData.pan} readOnly />
            </div>
          )}

          {requestedFields.includes("passport") && (
            <div>
              <label>Passport Number</label>
              <input value={decodedData.passport} readOnly />
            </div>
          )}

          {requestedFields.includes("voter") && (
            <div>
              <label>Voter ID</label>
              <input value={decodedData.voter} readOnly />
            </div>
          )}

          <p className="verified">✔ Verified via Blockchain</p>
          <button type="submit">Submit</button>
        </form>
      )}

      {/* STEP 4 */}
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
