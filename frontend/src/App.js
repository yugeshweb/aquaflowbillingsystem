import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const WaterBillingSystem = () => {
  // Real-time simulated data states
  const [waterFlow, setWaterFlow] = useState(0);
  const [tankLevel, setTankLevel] = useState(45);
  const [powerConsumption, setPowerConsumption] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);
  const [currentBill, setCurrentBill] = useState(0);
  const [isMotorOn, setIsMotorOn] = useState(false);

  // Constants for calculations
  const TANK_CAPACITY = 1000; // liters
  const WATER_RATE = 0.05; // $/liter
  const POWER_RATE = 0.12; // $/kWh

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate water flow (0-50 L/min)
      const newFlow = Math.random() * 50;
      setWaterFlow(newFlow);

      // Update tank level based on flow
      setTankLevel(prev => {
        const newLevel = Math.min(100, prev + (newFlow / TANK_CAPACITY) * 100 * 0.1);
        return newLevel;
      });

      // Simulate power consumption when motor is on
      if (isMotorOn) {
        setPowerConsumption(2.5 + Math.random() * 1.5); // 2.5-4 kW
      } else {
        setPowerConsumption(0.1 + Math.random() * 0.2); // Standby power
      }

      // Update usage and billing
      setTotalUsage(prev => prev + (newFlow / 60)); // Convert to liters per second
      setCurrentBill(prev => prev + (newFlow / 60 * WATER_RATE));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMotorOn]);

  // Auto toggle motor based on tank level
  useEffect(() => {
    if (tankLevel > 90) {
      setIsMotorOn(false);
    } else if (tankLevel < 30) {
      setIsMotorOn(true);
    }
  }, [tankLevel]);

  // Water particles animation component
  const WaterParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        className="water-particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ));
    return <div className="water-particles">{particles}</div>;
  };

  // Tank component with animated fill
  const AnimatedTank = () => (
    <div className="tank-container">
      <div className="tank-outer">
        <div className="tank-inner">
          <div 
            className="water-fill"
            style={{ height: `${tankLevel}%` }}
          >
            <div className="water-wave"></div>
            <div className="water-wave wave-2"></div>
          </div>
          <div className="tank-level-indicator">
            <span className="level-text">{tankLevel.toFixed(1)}%</span>
          </div>
        </div>
        <div className="tank-labels">
          <div className="tank-label top">FULL</div>
          <div className="tank-label bottom">EMPTY</div>
        </div>
      </div>
    </div>
  );

  // Circular gauge component
  const CircularGauge = ({ value, max, label, unit, color }) => {
    const percentage = (value / max) * 100;
    const strokeDasharray = 2 * Math.PI * 45;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    return (
      <div className="circular-gauge">
        <svg width="120" height="120">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            className="gauge-progress"
          />
        </svg>
        <div className="gauge-content">
          <div className="gauge-value">{value.toFixed(1)}</div>
          <div className="gauge-unit">{unit}</div>
          <div className="gauge-label">{label}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Animated background */}
      <div className="background-animation">
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">💧</span>
          AquaFlow Billing System
          <span className="title-glow"></span>
        </h1>
        <div className="status-indicator">
          <div className={`status-dot ${isMotorOn ? 'active' : 'inactive'}`}></div>
          <span className="status-text">
            Motor {isMotorOn ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="dashboard">
        {/* Tank Section */}
        <section className="glass-panel tank-section">
          <h2 className="section-title">Water Tank Status</h2>
          <AnimatedTank />
          <div className="tank-stats">
            <div className="stat-item">
              <span className="stat-label">Capacity</span>
              <span className="stat-value">{TANK_CAPACITY}L</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Current</span>
              <span className="stat-value">{(tankLevel * TANK_CAPACITY / 100).toFixed(0)}L</span>
            </div>
          </div>
        </section>

        {/* Flow Visualization */}
        <section className="glass-panel flow-section">
          <h2 className="section-title">Water Flow</h2>
          <div className="flow-visual">
            <WaterParticles />
            <div className="flow-meter">
              <div className="flow-value">
                {waterFlow.toFixed(1)}
                <span className="flow-unit">L/min</span>
              </div>
              <div className="flow-bar">
                <div 
                  className="flow-progress"
                  style={{ width: `${(waterFlow / 50) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Power Consumption */}
        <section className="glass-panel power-section">
          <h2 className="section-title">Power Consumption</h2>
          <CircularGauge 
            value={powerConsumption}
            max={5}
            label="Power"
            unit="kW"
            color="#ff6b6b"
          />
          <div className="power-stats">
            <div className="power-stat">
              <span className="power-label">Rate</span>
              <span className="power-value">${POWER_RATE}/kWh</span>
            </div>
            <div className="power-stat">
              <span className="power-label">Cost/hr</span>
              <span className="power-value">${(powerConsumption * POWER_RATE).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Billing Information */}
        <section className="glass-panel billing-section">
          <h2 className="section-title">Real-time Billing</h2>
          <div className="billing-display">
            <div className="bill-amount">
              <span className="currency">$</span>
              <span className="amount">{currentBill.toFixed(2)}</span>
            </div>
            <div className="billing-details">
              <div className="bill-item">
                <span className="bill-label">Water Usage</span>
                <span className="bill-value">{totalUsage.toFixed(1)} L</span>
              </div>
              <div className="bill-item">
                <span className="bill-label">Rate</span>
                <span className="bill-value">${WATER_RATE}/L</span>
              </div>
              <div className="bill-item">
                <span className="bill-label">Power Cost</span>
                <span className="bill-value">${(powerConsumption * POWER_RATE / 60).toFixed(4)}/min</span>
              </div>
            </div>
            <button 
              className="reset-btn"
              onClick={() => {
                setCurrentBill(0);
                setTotalUsage(0);
              }}
            >
              Reset Billing
            </button>
          </div>
        </section>

        {/* Usage Analytics */}
        <section className="glass-panel analytics-section">
          <h2 className="section-title">Usage Analytics</h2>
          <div className="analytics-grid">
            <CircularGauge 
              value={waterFlow}
              max={50}
              label="Flow Rate"
              unit="L/min"
              color="#4ecdc4"
            />
            <CircularGauge 
              value={tankLevel}
              max={100}
              label="Tank Level"
              unit="%"
              color="#45b7d1"
            />
            <CircularGauge 
              value={totalUsage % 100}
              max={100}
              label="Daily Usage"
              unit="L"
              color="#96ceb4"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>AquaFlow System v2.0</span>
          <span className="pulse-dot"></span>
          <span>Real-time Monitoring Active</span>
        </div>
      </footer>
    </div>
  );
};

export default WaterBillingSystem;