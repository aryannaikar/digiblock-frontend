import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './hom.css';
import safe from './safe.png';

export default function Hom() {
  const midRef = useRef(null);
  const endRef = useRef(null);
  const [stage, setStage] = useState('top');
  const [zoomOut, setZoomOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const midTop = midRef.current?.getBoundingClientRect().top;
      const endTop = endRef.current?.getBoundingClientRect().top;
      const screenHeight = window.innerHeight;

      if (endTop < screenHeight * 0.8) {
        setStage('end');
      } else if (midTop < screenHeight * 0.3) {
        setStage('middle');
      } else {
        setStage('top');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    setZoomOut(true);
    setTimeout(() => navigate('/shop'), 800); // Delay to match CSS animation
    
  };

  return (
    <div className="hom-container">
      <div className="hom-content">
        <h1>Welcome to ShopSmart 🛍️</h1>
        <p>Your one-stop destination for electronics, gadgets, and more.</p>
        <p>Browse our products and enjoy hassle-free shopping at great prices!</p>
       
      </div>

      <div className="image-holder">
        <img
          src={shopimg}
          alt="Shop"
          className={`moving-image ${stage} ${zoomOut ? 'zoom-out' : ''}`}
        />
      </div>

      <div className="scroll-section" ref={midRef}>
        {stage === 'middle' && (
          <div className="mid-text">
            <h2>Why Shop with Us?</h2>
            <p>
              Fast delivery, great prices, top-quality gadgets. Trusted by thousands!
            </p>
          </div>
        )}
      </div>

      <div className="scroll-section" ref={endRef}>
        {stage === 'end' && (
          <div className="end-content">
            <button className="shop-button" onClick={handleStart}>
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
