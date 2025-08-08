import React from 'react';
import './GettingStarted.css';

const GettingStarted = () => {
  return (
    <div className="getting-started-container">
      <div className="getting-started-header">
        <h1>Getting started is</h1>
        <h2>quick and easy</h2>
      </div>
      
      <div className="steps-container">
        <div className="step">
          <div className="step-number">1</div>
          <h3 className="step-title">Register Yourself</h3>
          {/* <div className="step-icon">@</div> */}
        </div>
        
        <div className="step">
          <div className="step-number">2</div>
          <h3 className="step-title">Verify Yourself</h3>
          {/* <div className="step-icon">@</div> */}
        </div>
        
        <div className="step">
          <div className="step-number">3</div>
          <h3 className="step-title">Fetch your Documents</h3>
          {/* <div className="step-icon">@</div> */}
        </div>
        
        <div className="step">
          <div className="step-number">4</div>
          <h3 className="step-title">Share Your Documents</h3>
          {/* <div className="step-icon">@</div> */}
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;