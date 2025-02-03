import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const InterpolationCalculator = () => {
  // State for input values and the result
  const [inputs, setInputs] = useState({
    X1: '1',
    Y1: '1',
    X2: '100',
    Y2: '100',
    X: '33',
  });
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Update state when an input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modify calculateInterpolation to make API call
  const calculateInterpolation = async () => {
    try {
      const response = await fetch('/interpolate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          X1: parseFloat(inputs.X1),
          Y1: parseFloat(inputs.Y1),
          X2: parseFloat(inputs.X2),
          Y2: parseFloat(inputs.Y2),
          X: parseFloat(inputs.X)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data.result);
      setSteps(data.steps);
      setCurrentStep(0);
    } catch (error) {
      alert(error.message);
      console.error('Error:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Prepare data for the graph
  const data = {
    datasets: [
      {
        label: 'Interpolation Line',
        data: [
          { x: parseFloat(inputs.X1), y: parseFloat(inputs.Y1) },
          ...(result !== null ? [{ x: parseFloat(inputs.X), y: result }] : []),
          { x: parseFloat(inputs.X2), y: parseFloat(inputs.Y2) },
        ],
        fill: false,
        borderColor: '#4CAF50',
        tension: 0.1,
        pointBackgroundColor: '#4CAF50',
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: { 
          display: true, 
          text: 'X',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: '#e0e0e0'
        }
      },
      y: {
        title: { 
          display: true, 
          text: 'Y',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: '#e0e0e0'
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 12
        }
      }
    }
  };

  // Añadir datos de prueba
  const testCases = [
    { x1: 0, y1: 0, x2: 10, y2: 20, x: 5, result: 10 },
    { x1: 1, y1: 2, x2: 5, y2: 10, x: 3, result: 6 },
    { x1: -2, y1: 4, x2: 2, y2: 12, x: 0, result: 8 },
    { x1: 10, y1: 100, x2: 20, y2: 200, x: 15, result: 150 },
    { x1: 0, y1: 5, x2: 100, y2: 15, x: 50, result: 10 }
  ];

  const DataFlowDiagram = ({ step }) => {
    // Determinar las flechas activas basadas en la instrucción actual
    const getActiveFlows = (instruction) => {
      if (instruction.includes('Inicialización')) {
        return { toMemory: true };
      }
      if (instruction.includes('lw')) {
        return { memoryToRegisters: true };
      }
      if (instruction.includes('sub') || instruction.includes('mul') || instruction.includes('div')) {
        return { betweenRegisters: true };
      }
      return {};
    };

    const flows = getActiveFlows(step?.instruction || '');

    return (
      <div className="data-flow-diagram">
        <div className="diagram-title">Flujo de Datos</div>
        <div className="diagram-container">
          {/* Memoria */}
          <div className="memory-block">
            <div className="block-title">.data</div>
            <div className="memory-content-visual">
              {Object.entries(step?.memory?.data || {}).map(([key, value]) => (
                <div key={key} className="memory-item">
                  {key}: {value}
                </div>
              ))}
            </div>
          </div>

          {/* Flechas de flujo */}
          <div className={`data-flow ${flows.memoryToRegisters ? 'active' : ''}`}>
            <div className="arrow-line"></div>
            <div className="arrow-head"></div>
          </div>

          {/* Registros */}
          <div className="registers-block">
            <div className="block-title">Registros</div>
            <div className="registers-content-visual">
              <div className="register-group">
                <div className="group-title">Saved ($s)</div>
                {Object.entries(step?.registers || {})
                  .filter(([reg]) => reg.startsWith('s'))
                  .map(([reg, value]) => (
                    <div key={reg} className="register-item">
                      ${reg}: {value}
                    </div>
                  ))}
              </div>
              <div className="register-group">
                <div className="group-title">Temp ($t)</div>
                {Object.entries(step?.registers || {})
                  .filter(([reg]) => reg.startsWith('t'))
                  .map(([reg, value]) => (
                    <div key={reg} className="register-item">
                      ${reg}: {value}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calculator-container">
      <div className="calculator-card">
        <div className="left-panel">
          <h1 className="calculator-title">Linear Interpolation Calculator</h1>
          
          <div className="input-grid">
            <div className="input-group">
              <label className="input-label">
                Point 1:
                <div className="coordinate-inputs">
                  <div className="slider-input">
                    <span>X1: {inputs.X1}</span>
                    <input
                      type="number"
                      name="X1"
                      value={inputs.X1}
                      onChange={handleChange}
                      placeholder="X1"
                      className="coordinate-input number-input"
                    />
                    <input
                      type="range"
                      name="X1"
                      value={inputs.X1}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      className="coordinate-slider"
                    />
                  </div>
                  <div className="slider-input">
                    <span>Y1: {inputs.Y1}</span>
                    <input
                      type="number"
                      name="Y1"
                      value={inputs.Y1}
                      onChange={handleChange}
                      placeholder="Y1"
                      className="coordinate-input number-input"
                    />
                    <input
                      type="range"
                      name="Y1"
                      value={inputs.Y1}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      className="coordinate-slider"
                    />
                  </div>
                </div>
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">
                Point 2:
                <div className="coordinate-inputs">
                  <div className="slider-input">
                    <span>X2: {inputs.X2}</span>
                    <input
                      type="number"
                      name="X2"
                      value={inputs.X2}
                      onChange={handleChange}
                      placeholder="X2"
                      className="coordinate-input number-input"
                    />
                    <input
                      type="range"
                      name="X2"
                      value={inputs.X2}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      className="coordinate-slider"
                    />
                  </div>
                  <div className="slider-input">
                    <span>Y2: {inputs.Y2}</span>
                    <input
                      type="number"
                      name="Y2"
                      value={inputs.Y2}
                      onChange={handleChange}
                      placeholder="Y2"
                      className="coordinate-input number-input"
                    />
                    <input
                      type="range"
                      name="Y2"
                      value={inputs.Y2}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      className="coordinate-slider"
                    />
                  </div>
                </div>
              </label>
            </div>

            <div className="input-group">
              <label className="input-label">
                Interpolate at X: {inputs.X}
                <input
                  type="number"
                  name="X"
                  value={inputs.X}
                  onChange={handleChange}
                  placeholder="X"
                  className="single-input x-number"
                />
                <input
                  type="range"
                  name="X"
                  value={inputs.X || 0}
                  onChange={handleChange}
                  min={inputs.X1 || 0}
                  max={inputs.X2 || 100}
                  step="1"
                  className="x-slider"
                  disabled={!inputs.X1 || !inputs.X2}
                />
              </label>
            </div>
          </div>

          <button 
            onClick={calculateInterpolation} 
            className="calculate-button"
          >
            Calculate Y
          </button>

          {result !== null && (
            <div className="result-section">
              <h2 className="result-text">Y = {result.toFixed(2)}</h2>
              <div className="chart-container">
                <Line data={data} options={options} />
              </div>
            </div>
          )}

          {/* Añadir tabla de casos de prueba */}
          <div className="test-cases-section">
            <h2 className="section-title">Casos de Prueba</h2>
            <div className="table-container">
              <table className="test-cases-table">
                <thead>
                  <tr>
                    <th>Caso</th>
                    <th>X1</th>
                    <th>Y1</th>
                    <th>X2</th>
                    <th>Y2</th>
                    <th>X</th>
                    <th>Resultado (Y)</th>
                  </tr>
                </thead>
                <tbody>
                  {testCases.map((test, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{test.x1}</td>
                      <td>{test.y1}</td>
                      <td>{test.x2}</td>
                      <td>{test.y2}</td>
                      <td>{test.x}</td>
                      <td>{test.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {steps.length > 0 ? (
            <div className="simulator-section">
              <div className="simulator-header">
                <h2 className="simulator-title">Simulador MIPS</h2>
              </div>
              
              <div className="simulator-toolbar">
                <div className="simulator-note">
                  <strong>¿Qué está pasando?</strong> Este simulador muestra cómo MIPS ejecuta la interpolación lineal:
                </div>
                <div className="simulator-note">
                  1. Los valores se cargan en la sección <span className="simulator-highlight">.data</span> de la memoria
                </div>
                <div className="simulator-note">
                  2. Se transfieren a registros <span className="simulator-highlight">$s0-$s4</span> para operar con ellos
                </div>
                <div className="simulator-note">
                  3. Los cálculos se realizan usando registros temporales <span className="simulator-highlight">$t0-$t4</span>
                </div>
                <div className="simulator-note">
                  4. El resultado final se almacena en <span className="simulator-highlight">$v0</span>
                </div>
              </div>
              
              <div className="simulator-controls">
                <button 
                  onClick={prevStep} 
                  disabled={currentStep === 0}
                  className="control-button"
                >
                  ← Anterior
                </button>
                <span className="step-counter">
                  Paso {currentStep + 1} de {steps.length}
                </span>
                <button 
                  onClick={nextStep} 
                  disabled={currentStep === steps.length - 1}
                  className="control-button"
                >
                  Siguiente →
                </button>
              </div>

              <div className="simulator-grid">
                <div className="diagram-panel">
                  <DataFlowDiagram step={steps[currentStep]} />
                </div>
                <div className="instruction-panel">
                  <h3>Instrucción Actual</h3>
                  <div className="instruction-box">
                    <code>{steps[currentStep]?.instruction}</code>
                    <div className="instruction-explanation">
                      <strong>Explicación:</strong>
                      <p>{steps[currentStep]?.description}</p>
                      <div className="calculation-steps">
                        <strong>Fórmula:</strong>
                        <p className="formula">{steps[currentStep]?.formula}</p>
                        <strong>Cálculo actual:</strong>
                        <pre className="current-calculation">
                          {steps[currentStep]?.current_calculation}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="simulator-placeholder">
              <h2 className="simulator-title">Simulador MIPS</h2>
              <p className="simulator-message">
                Ingresa valores y presiona "Calculate Y" para ver la simulación MIPS
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterpolationCalculator; 