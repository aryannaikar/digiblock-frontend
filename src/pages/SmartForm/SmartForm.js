import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import jsQR from "jsqr";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "./SmartForm.css";

export default function SmartForm() {

  const { authAxios } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlFormId = queryParams.get("id");

  /* ================= STATE ================= */

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("sf_activeTab") || (urlFormId ? "fill" : "create")
  );

  const [formTitle, setFormTitle] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);

  const [generatedLink, setGeneratedLink] = useState(
    localStorage.getItem("sf_generatedLink") || ""
  );

  const [createdFormId, setCreatedFormId] = useState(
    localStorage.getItem("sf_createdFormId") || ""
  );

  const [enteredId, setEnteredId] = useState(
    localStorage.getItem("sf_enteredId") || urlFormId || ""
  );

  const [loadedForm, setLoadedForm] = useState(
    JSON.parse(localStorage.getItem("sf_loadedForm")) || null
  );

  const [collectedDocs, setCollectedDocs] = useState(
    JSON.parse(localStorage.getItem("sf_collectedDocs")) || {}
  );

  const [submissions, setSubmissions] = useState([]);

  const [qrValue, setQrValue] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const availableFields = [
    { label: "Aadhaar Number", value: "aadhaarNumber" },
    { label: "PAN Number", value: "panNumber" }
  ];

  /* ================= PERSIST STATE ================= */

  useEffect(() => {
    localStorage.setItem("sf_activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("sf_enteredId", enteredId);
  }, [enteredId]);

  useEffect(() => {
    localStorage.setItem("sf_loadedForm", JSON.stringify(loadedForm));
  }, [loadedForm]);

  useEffect(() => {
    localStorage.setItem("sf_collectedDocs", JSON.stringify(collectedDocs));
  }, [collectedDocs]);

  useEffect(() => {
    localStorage.setItem("sf_createdFormId", createdFormId);
  }, [createdFormId]);

  useEffect(() => {
    localStorage.setItem("sf_generatedLink", generatedLink);
  }, [generatedLink]);

  /* ================= RESET FILL ================= */

  const resetFillForm = () => {
    setLoadedForm(null);
    setCollectedDocs({});
    setEnteredId("");
    setMessage("");
    setError("");

    localStorage.removeItem("sf_loadedForm");
    localStorage.removeItem("sf_collectedDocs");
    localStorage.removeItem("sf_enteredId");
  };

  /* ================= CREATE FORM ================= */

  const toggleField = (value) => {
    setSelectedFields(prev =>
      prev.includes(value)
        ? prev.filter(f => f !== value)
        : [...prev, value]
    );
  };

  const createForm = async () => {
    try {

      const fields = selectedFields.map(field => ({
        label: field,
        name: field,
        type: "text",
        required: true
      }));

      const res = await authAxios.post("/api/forms/create", {
        title: formTitle,
        organizationName: "DigiBlock",
        fields
      });

      setGeneratedLink(res.data.shareableLink);
      setCreatedFormId(res.data.form.formId);
      setMessage("Form Created Successfully");

      fetchSubmissions(res.data.form.formId);

    } catch {
      setError("Create failed");
    }
  };

  /* ================= FETCH SUBMISSIONS ================= */

  const fetchSubmissions = async (formId) => {
    try {
      const res = await authAxios.get(`/api/forms/submissions/${formId}`);
      setSubmissions(res.data);
    } catch {
      setSubmissions([]);
    }
  };

  useEffect(() => {

    const currentFormId =
      createdFormId ||
      (loadedForm && loadedForm.formId) ||
      urlFormId;

    if (currentFormId) {
      fetchSubmissions(currentFormId);
    }

  }, [createdFormId, loadedForm, urlFormId]);


  /* ================= LOAD FORM ================= */

  const loadForm = async (id) => {
    try {
      const res = await authAxios.get(`/api/forms/view/${id}`);
      setLoadedForm(res.data);
      setError("");
    } catch {
      setError("Form not found");
    }
  };

  useEffect(() => {
    if (urlFormId) loadForm(urlFormId);
  }, [urlFormId]);

  /* ================= QR PROCESS ================= */

  const processQR = (data) => {
    try {
      const parsed = JSON.parse(atob(data));

      if (!parsed.folder || !parsed.mainDocNumber) {
        setError("Invalid QR structure");
        return;
      }

      setCollectedDocs(prev => ({
        ...prev,
        [parsed.folder]: parsed
      }));

      setMessage("QR Loaded");

    } catch {
      setError("Invalid QR");
    }
  };

  const handleScan = (result) => {
    if (result?.text) processQR(result.text);
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.src = reader.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) processQR(code.data);
      };
    };

    reader.readAsDataURL(file);
  };

  const handlePasteQR = () => {
    if (!qrValue) return;
    processQR(qrValue);
  };

  /* ================= AUTO FILL ================= */

  const getFieldValue = (field) => {
    if (field === "aadhaarNumber" && collectedDocs["Aadhaar"])
      return collectedDocs["Aadhaar"].mainDocNumber;

    if (field === "panNumber" && collectedDocs["PAN"])
      return collectedDocs["PAN"].mainDocNumber;

    return "";
  };

  /* ================= SUBMIT ================= */

  const submitForm = async () => {

    const formData = {};
    loadedForm.fields.forEach(field => {
      formData[field.name] = getFieldValue(field.name);
    });

    const documentsUsed = Object.values(collectedDocs).map(doc => ({
      folder: doc.folder,
      mainDocNumber: doc.mainDocNumber,
      txHash: doc.txHash || ""
    }));

    try {
      await authAxios.post(
        `/api/forms/submit/${loadedForm.formId}`,
        {
          data: formData,
          documentsUsed
        }
      );

      setMessage("Submitted Successfully");

    } catch {
      setError("Submit failed");
    }
  };

  /* ================= UI ================= */

  return (
    <motion.div
      className="smartform-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>🧠 DigiBlock Smart Form</h2>

      <div className="smartform-nav">
        <button onClick={() => setActiveTab("create")}>Create</button>
        <button onClick={() => setActiveTab("fill")}>Fill</button>
      </div>

      {/* ================= CREATE TAB ================= */}
      {activeTab === "create" && (
        <div className="card">

          <input
            placeholder="Form Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          {availableFields.map(field => (
            <label key={field.value}>
              <input type="checkbox" onChange={() => toggleField(field.value)} />
              {field.label}
            </label>
          ))}

          <button onClick={createForm}>Create Form</button>

          {generatedLink && <p><strong>Share:</strong> {generatedLink}</p>}

          {submissions.length > 0 && (
            <>
              <h3>📥 Submissions</h3>

              {submissions.map((sub, index) => (
                <div key={index} className="result-box">

                  <h4>Form Data:</h4>
                  {sub.data &&
                    Object.entries(sub.data).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}

                  <h4>Documents Used:</h4>
                  {sub.documentsUsed &&
                    sub.documentsUsed.map((doc, i) => (
                      <div key={i}>
                        <strong>Folder:</strong> {doc.folder} <br />
                        <strong>Document Number:</strong> {doc.mainDocNumber}
                        <hr />
                      </div>
                    ))}

                </div>
              ))}
            </>
          )}

        </div>
      )}

      {/* ================= FILL TAB ================= */}
      {activeTab === "fill" && (
        <div className="card">

          {loadedForm && (
            <button onClick={resetFillForm}>
              🔄 Load New Form
            </button>
          )}

          {!loadedForm && (
            <>
              <input
                placeholder="Enter Form ID"
                value={enteredId}
                onChange={(e) => setEnteredId(e.target.value)}
              />
              <button onClick={() => loadForm(enteredId)}>Load</button>
            </>
          )}

          {loadedForm && (
            <>
              <h3>{loadedForm.title}</h3>

              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={handleScan}
                style={{ width: "100%" }}
              />

              <input type="file" accept="image/*" onChange={handleQRUpload} />

              <input
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                placeholder="Paste QR"
              />
              <button onClick={handlePasteQR}>Decode</button>

              <hr />

              {loadedForm.fields.map(field => (
                <div key={field.name}>
                  <input value={getFieldValue(field.name)} disabled />
                </div>
              ))}

              <button onClick={submitForm}>Submit</button>
            </>
          )}

        </div>
      )}

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

    </motion.div>
  );
}
