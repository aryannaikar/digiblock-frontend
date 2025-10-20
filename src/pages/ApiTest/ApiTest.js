import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ApiTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then((res) => setMessage(res.data))
      .catch((err) => setMessage("Error connecting to backend"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Backend Connection Test</h2>
      <p>{message}</p>
    </div>
  );
}
