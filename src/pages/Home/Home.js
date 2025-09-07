import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [zooming, setZooming] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.body.appendChild(script);

    const locker = document.getElementById("locker");

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = scrollY / maxScroll;

      if (progress < 0.33) {
        locker.style.transform = "translate(50%, -80%)";
      } else if (progress < 0.65) {
        locker.style.transform = "translate(-130%, -50%)";
      } else {
        locker.style.transform = "translate(-50%, -50%)";
      }

      const totalRotation =
        progress < 0.5
          ? progress * 2 * 360
          : 360 + (progress - 0.5) * 2 * 320;
      locker.setAttribute("camera-orbit", `${totalRotation}deg auto auto`);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeChild(script);
    };
  }, []);

  const handleGetStarted = () => {
    setZooming(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000); // matches CSS animation time
  };

  return (
    <div className="home-container safe-scroll">
      <h1 className="Wel">Welcome {user?.username}!</h1>
      <model-viewer
        id="locker"
        className={zooming ? "zoom-in" : ""}
        src="/safe.glb"
        shadow-intensity="1"
        exposure="1.1"
        environment-image="neutral"
        disable-zoom
        interaction-policy="none"
      ></model-viewer>

      <div className="container">
        <div className="p1">
          <p>
            DigiBlock is your secure, blockchain-powered digital locker.
            Store important documents, certificates, and credentials with complete confidence,
            knowing that every files authenticity is protected by cryptographic verification.
            No tampering. No unauthorized access. Your data, your control.
          </p>
        </div>

        <div className="p2">
          <p>
            With blockchain integration, each upload is hashed and recorded on the ledger,
            creating a permanent, verifiable record of ownership.
            Access your documents anywhere, anytime — and share them with full proof of integrity.
            Welcome to the future of secure digital storage.
          </p>
        </div>

       <button
  className={`get-started ${zooming ? "fade-out" : ""}`}
  onClick={handleGetStarted}
>
  GET STARTED
</button>

      </div>
    </div>
  );
}
