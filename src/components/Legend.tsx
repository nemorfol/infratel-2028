import React from 'react';

// New legend data based on the 'barrato' status
const legendItems = [
  { color: 'green', description: 'Civico entro 50m da reti >300Mbit/s (B)' },
  { color: 'yellow', description: 'Civico oltre 50m da reti >300Mbit/s (C)' },
  { color: 'red', description: 'Civico con scarsa qualità della coordinata (A)' },
  { color: 'gray', description: 'Nessuno stato specifico' },
];

const Legend = () => {
  return (
    <div className="legend-container">
      <h4 className="legend-title">Legenda Stato Civico</h4>
      <ul className="legend-list">
        {legendItems.map((item, index) => (
          <li key={index} className="legend-item">
            <span
              className="legend-color-box"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="legend-description">{item.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;