import React, { useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const navigate = useNavigate();

  const frameCount = 206;

  const currentFrame = (index) =>
    `${process.env.PUBLIC_URL}/frames/ezgif-frame-${String(index).padStart(3, "0")}.jpg`;

  // Particle Animation Effect
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = document.body.scrollHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(0, 255, 225, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(156, 39, 176, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const images = new Array(frameCount);

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);

      img.onload = () => {
        images[i - 1] = img;

        if (i === 1) {
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };

      img.onerror = () => {
        console.warn("Frame missing:", img.src);
      };
    }

    const render = (index) => {
      const img = images[index];
      if (!img || !img.complete) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    const onScroll = () => {
      const section = sectionRef.current;
      const scrollTop = window.scrollY;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollableHeight = sectionHeight - window.innerHeight;

      const progress = Math.max(
        0,
        Math.min(1, (scrollTop - sectionTop) / scrollableHeight)
      );

      const frameIndex = Math.floor(progress * (frameCount - 1));

      requestAnimationFrame(() => render(frameIndex));
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 3D Tilt Effect for Cards
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleCardMouseLeave = (e) => {
    e.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  return (
    <div className="home-wrapper">
      {/* Particle Background */}
      <canvas ref={particleCanvasRef} className="particle-canvas"></canvas>

      {/* Scroll Animation Section */}
      <section ref={sectionRef} className="hero-section">
        <canvas ref={canvasRef} className="hero-canvas" />
      </section>


      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose DigiBlock?</h2>
        <div className="features-grid">
          <div
            className="feature-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon">🔒</div>
            <h3>Blockchain Security</h3>
            <p>Your documents are secured with immutable blockchain technology, ensuring tamper-proof storage.</p>
          </div>
          <div
            className="feature-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon">⚡</div>
            <h3>Instant Verification</h3>
            <p>Verify document authenticity in seconds with cryptographic proof and digital signatures.</p>
          </div>
          <div
            className="feature-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon">🌐</div>
            <h3>Decentralized Storage</h3>
            <p>No single point of failure. Your data is distributed across a secure decentralized network.</p>
          </div>
          <div
            className="feature-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon">🔐</div>
            <h3>Private & Encrypted</h3>
            <p>End-to-end encryption ensures only you have access to your sensitive documents.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Documents</h3>
            <p>Securely upload your identity documents and certificates to the vault.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Blockchain Verification</h3>
            <p>Documents are hashed and recorded on the blockchain for immutable proof.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Share & Verify</h3>
            <p>Generate secure links to share and verify your documents instantly.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Secure Your Digital Identity?</h2>
          <p>Join thousands of users protecting their documents with blockchain technology.</p>
          <button onClick={() => navigate("/dashboard")} className="cta-button">
            Start Now - It's Free
          </button>
        </div>
      </section>

    </div>
  );
}
