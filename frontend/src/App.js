import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const WaterBillingSystem = () => {
  // Tank water levels
  const [undergroundTankLevel, setUndergroundTankLevel] = useState(35);
  const [overheadTankLevel, setOverheadTankLevel] = useState(65);
  
  // Water flow and power
  const [waterFlow, setWaterFlow] = useState(0);
  const [overallPowerConsumption, setOverallPowerConsumption] = useState(0);
  const [pumpToUnderground, setPumpToUnderground] = useState(false);
  const [pumpToOverhead, setPumpToOverhead] = useState(false);
  
  // House consumption data
  const [houseData, setHouseData] = useState({
    house1: { dailyUsage: 0, monthlyUsage: 180, currentBill: 0, flowRate: 0 },
    house2: { dailyUsage: 0, monthlyUsage: 220, currentBill: 0, flowRate: 0 },
    house3: { dailyUsage: 0, monthlyUsage: 195, currentBill: 0, flowRate: 0 },
    house4: { dailyUsage: 0, monthlyUsage: 160, currentBill: 0, flowRate: 0 }
  });
  
  // System status
  const [leakageDetected, setLeakageDetected] = useState(false);
  const [sensorsActive, setSensorsActive] = useState(true);
  const [wateringMode, setWateringMode] = useState('auto'); // 'on', 'off', 'auto'
  
  // Constants
  const UNDERGROUND_CAPACITY = 5000; // liters
  const OVERHEAD_CAPACITY = 1500; // liters
  const WATER_RATE = 3.5; // ₹/liter
  const POWER_RATE = 8.5; // ₹/kWh

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update tank levels
      setUndergroundTankLevel(prev => {
        let newLevel = prev;
        if (pumpToUnderground) {
          newLevel = Math.min(100, prev + Math.random() * 2);
        }
        // Water consumption from underground affects level
        const totalConsumption = Object.values(houseData).reduce((sum, house) => sum + house.flowRate, 0);
        newLevel = Math.max(0, newLevel - (totalConsumption / UNDERGROUND_CAPACITY) * 100 * 0.1);
        return newLevel;
      });

      setOverheadTankLevel(prev => {
        let newLevel = prev;
        if (pumpToOverhead) {
          newLevel = Math.min(100, prev + Math.random() * 1.5);
        }
        // Water flows from overhead to houses
        newLevel = Math.max(0, newLevel - Math.random() * 0.5);
        return newLevel;
      });

      // Update water flow
      setWaterFlow(20 + Math.random() * 30);

      // Update house consumption
      setHouseData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(house => {
          const baseFlow = Math.random() * 15; // Random flow 0-15 L/min
          const flowRate = wateringMode === 'off' ? 0 : baseFlow;
          
          newData[house] = {
            ...newData[house],
            flowRate: flowRate,
            dailyUsage: newData[house].dailyUsage + (flowRate / 60), // Convert to L/second
            currentBill: newData[house].currentBill + (flowRate / 60 * WATER_RATE)
          };
        });
        return newData;
      });

      // Update power consumption
      const totalFlow = Object.values(houseData).reduce((sum, house) => sum + house.flowRate, 0);
      let powerConsumption = 0.5; // Base consumption
      if (pumpToUnderground) powerConsumption += 3.5;
      if (pumpToOverhead) powerConsumption += 2.5;
      powerConsumption += totalFlow * 0.05; // Additional power for flow
      setOverallPowerConsumption(powerConsumption);

    }, 1000);

    return () => clearInterval(interval);
  }, [pumpToUnderground, pumpToOverhead, houseData, wateringMode]);

  // Auto pump control
  useEffect(() => {
    if (undergroundTankLevel < 20) {
      setPumpToUnderground(true);
    } else if (undergroundTankLevel > 90) {
      setPumpToUnderground(false);
    }

    if (overheadTankLevel < 30 && undergroundTankLevel > 40) {
      setPumpToOverhead(true);
    } else if (overheadTankLevel > 85) {
      setPumpToOverhead(false);
    }
  }, [undergroundTankLevel, overheadTankLevel]);

  // Underground Tank Component
  const UndergroundTank = () => (
    <div className="tank-container underground">
      <h3 className="tank-title">Underground Tank</h3>
      <div className="tank-visual underground-visual">
        <div className="tank-structure underground-structure">
          <div 
            className="water-fill underground-fill"
            style={{ height: `${undergroundTankLevel}%` }}
          >
            <div className="water-wave"></div>
            <div className="water-wave wave-2"></div>
            <div className="water-bubbles">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bubble" style={{
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}></div>
              ))}
            </div>
          </div>
          <div className="tank-level-display">
            <span className="level-percentage">{undergroundTankLevel.toFixed(1)}%</span>
            <span className="level-liters">{(undergroundTankLevel * UNDERGROUND_CAPACITY / 100).toFixed(0)}L</span>
          </div>
        </div>
        <div className="tank-info">
          <div className="tank-stat">
            <span className="stat-label">Capacity</span>
            <span className="stat-value">{UNDERGROUND_CAPACITY}L</span>
          </div>
          <div className="tank-stat">
            <span className="stat-label">Status</span>
            <span className={`stat-value ${pumpToUnderground ? 'filling' : 'stable'}`}>
              {pumpToUnderground ? 'FILLING' : 'STABLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Overhead Tank Component
  const OverheadTank = () => (
    <div className="tank-container overhead">
      <h3 className="tank-title">Overhead Tank</h3>
      <div className="tank-visual overhead-visual">
        <div className="tank-structure overhead-structure">
          <div 
            className="water-fill overhead-fill"
            style={{ height: `${overheadTankLevel}%` }}
          >
            <div className="water-wave"></div>
            <div className="water-wave wave-2"></div>
          </div>
          <div className="tank-level-display">
            <span className="level-percentage">{overheadTankLevel.toFixed(1)}%</span>
            <span className="level-liters">{(overheadTankLevel * OVERHEAD_CAPACITY / 100).toFixed(0)}L</span>
          </div>
        </div>
        <div className="tank-info">
          <div className="tank-stat">
            <span className="stat-label">Capacity</span>
            <span className="stat-value">{OVERHEAD_CAPACITY}L</span>
          </div>
          <div className="tank-stat">
            <span className="stat-label">Status</span>
            <span className={`stat-value ${pumpToOverhead ? 'filling' : 'stable'}`}>
              {pumpToOverhead ? 'FILLING' : 'STABLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // House Consumption Component
  const HouseConsumption = ({ houseNum, data }) => (
    <div className="house-panel">
      <h4 className="house-title">House {houseNum}</h4>
      <div className="house-stats">
        <div className="usage-display">
          <div className="usage-item">
            <span className="usage-label">Today</span>
            <span className="usage-value">{data.dailyUsage.toFixed(1)}L</span>
          </div>
          <div className="usage-item">
            <span className="usage-label">Monthly</span>
            <span className="usage-value">{data.monthlyUsage}L</span>
          </div>
          <div className="usage-item">
            <span className="usage-label">Flow Rate</span>
            <span className="usage-value">{data.flowRate.toFixed(1)} L/min</span>
          </div>
        </div>
        <div className="billing-display-small">
          <span className="bill-label">Current Bill</span>
          <span className="bill-amount-small">₹{data.currentBill.toFixed(2)}</span>
        </div>
        <div className="flow-indicator">
          <div className="flow-bar-small">
            <div 
              className="flow-progress-small"
              style={{ width: `${(data.flowRate / 15) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Status Indicator Component
  const StatusIndicator = ({ label, status, activeText, inactiveText }) => (
    <div className="status-indicator-panel">
      <div className="status-light-container">
        <div className={`status-light ${status ? 'active' : 'inactive'}`}>
          <div className="light-glow"></div>
          <div className="light-pulse"></div>
        </div>
        <span className="status-label">{label}</span>
      </div>
      <span className="status-text">
        {status ? activeText : inactiveText}
      </span>
    </div>
  );

  // Watering Control Component
  const WateringControl = () => (
    <div className="watering-control">
      <h4 className="control-title">Watering System</h4>
      <div className="control-buttons">
        {['on', 'off', 'auto'].map(mode => (
          <button
            key={mode}
            className={`control-btn ${wateringMode === mode ? 'active' : ''}`}
            onClick={() => setWateringMode(mode)}
          >
            <span className="btn-text">{mode.toUpperCase()}</span>
            {wateringMode === mode && <div className="btn-glow"></div>}
          </button>
        ))}
      </div>
      <div className="control-status">
        <span className="status-label">Current Mode:</span>
        <span className={`status-value mode-${wateringMode}`}>
          {wateringMode.toUpperCase()}
        </span>
      </div>
    </div>
  );

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
          AquaFlow Management System
          <span className="title-glow"></span>
        </h1>
      </header>

      {/* Main Dashboard */}
      <main className="dashboard enhanced">
        {/* Tank Systems */}
        <section className="glass-panel tank-systems">
          <h2 className="section-title">Water Tank Systems</h2>
          <div className="tanks-grid">
            <UndergroundTank />
            <OverheadTank />
          </div>
        </section>

        {/* House Consumption */}
        <section className="glass-panel houses-section">
          <h2 className="section-title">House Water Consumption</h2>
          <div className="houses-grid">
            {Object.entries(houseData).map(([houseKey, data], index) => (
              <HouseConsumption 
                key={houseKey}
                houseNum={index + 1}
                data={data}
              />
            ))}
          </div>
          <div className="houses-summary">
            <div className="summary-item">
              <span className="summary-label">Total Daily Usage</span>
              <span className="summary-value">
                {Object.values(houseData).reduce((sum, house) => sum + house.dailyUsage, 0).toFixed(1)}L
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Monthly</span>
              <span className="summary-value">
                {Object.values(houseData).reduce((sum, house) => sum + house.monthlyUsage, 0)}L
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Combined Bill</span>
              <span className="summary-value">
                ₹{Object.values(houseData).reduce((sum, house) => sum + house.currentBill, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Power Consumption */}
        <section className="glass-panel power-section-enhanced">
          <h2 className="section-title">Overall Power Consumption</h2>
          <div className="power-display">
            <div className="power-gauge-large">
              <svg width="180" height="180">
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#ff6b6b"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 - (2 * Math.PI * 70 * overallPowerConsumption) / 10}
                  transform="rotate(-90 90 90)"
                  className="gauge-progress"
                />
              </svg>
              <div className="gauge-content-large">
                <div className="gauge-value-large">{overallPowerConsumption.toFixed(1)}</div>
                <div className="gauge-unit-large">kW</div>
              </div>
            </div>
            <div className="power-breakdown">
              <div className="power-item">
                <span className="power-label">Rate</span>
                <span className="power-value">₹{POWER_RATE}/kWh</span>
              </div>
              <div className="power-item">
                <span className="power-label">Hourly Cost</span>
                <span className="power-value">₹{(overallPowerConsumption * POWER_RATE).toFixed(2)}</span>
              </div>
              <div className="power-item">
                <span className="power-label">Underground Pump</span>
                <span className={`power-status ${pumpToUnderground ? 'active' : 'inactive'}`}>
                  {pumpToUnderground ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <div className="power-item">
                <span className="power-label">Overhead Pump</span>
                <span className={`power-status ${pumpToOverhead ? 'active' : 'inactive'}`}>
                  {pumpToOverhead ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className="glass-panel sensor-status">
          <h2 className="section-title">Sensor Status</h2>
          <div className="status-grid">
            <StatusIndicator 
              label="Leakage Detection"
              status={!leakageDetected}
              activeText="NO LEAKS DETECTED"
              inactiveText="LEAK DETECTED!"
            />
            <StatusIndicator 
              label="Sensor Activity"
              status={sensorsActive}
              activeText="SENSORS ACTIVE"
              inactiveText="SENSORS OFFLINE"
            />
          </div>
        </section>

        {/* Watering Control */}
        <section className="glass-panel watering-section">
          <WateringControl />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>AquaFlow Management System v3.0</span>
          <span className="pulse-dot"></span>
          <span>Multi-Tank Monitoring Active</span>
        </div>
      </footer>
    </div>
  );
};

export default WaterBillingSystem;