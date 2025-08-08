import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Scene3D from '../../components/Scene3D';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './home.css';

export default function Home() {
  const { user } = useAuth();
  const contentRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 💡 Model Y-axis movement based on scroll position
  const maxVerticalMovement = 5;
  const verticalMovement = -(scrollY / window.innerHeight) * maxVerticalMovement;

  const modelPosition = [0, verticalMovement, 0];
  const modelScale = 1;
  const textPosition = 'center';

  return (
    <div className='home-container'>
      <div className="hero-section">
        <div className={`hero-content ${textPosition}`}>
          <h1>Welcome {user.username}!</h1>
          <p className="hero-subtitle">Your Digital Safe is Ready</p>
        </div>
        <div className="model-container">
          <Scene3D 
            position={modelPosition} 
            scale={modelScale} 
            isExpanding={false}
          />
        </div>
      </div>

      <div className="content-section" ref={contentRef}>
        <h2>Secure Your Digital Life</h2>
        <p>Store your important documents, certificates, and files securely in your personal digital locker.</p>
      </div>

      <div className="features-section" ref={featuresRef}>
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🔒 Secure Storage</h3>
            <p>Bank-level encryption keeps your data safe</p>
          </div>
          <div className="feature-card">
            <h3>📱 Easy Access</h3>
            <p>Access your documents anytime, anywhere</p>
          </div>
          <div className="feature-card">
            <h3>🔄 Auto Sync</h3>
            <p>Your data syncs across all your devices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
