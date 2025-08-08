import React, { useState, useEffect } from 'react';
import './Banner.css';
import drive from './img/drive.png';
import secure from './img/secure.png'
import doc from './img/doc.jpg'
import em from './img/emergency.jpg'
const images = [
  drive,
  secure,
  doc,
  em
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <div className="banner-container">
      <button className="arrow left" onClick={prevSlide}>&#10094;</button>
      <img src={images[current]} alt="slide" className="banner-image" />
      <button className="arrow right" onClick={nextSlide}>&#10095;</button>
    </div>
  );
}
