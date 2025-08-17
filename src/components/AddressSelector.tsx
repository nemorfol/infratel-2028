'use client';

import React from 'react';

interface AddressSelectorProps {
  regioni: string[];
  province: string[];
  comuni: string[];
  strade: string[];
  selectedRegion: string;
  selectedProvince: string;
  selectedComune: string;
  selectedStrada: string;
  selectedStato: string;
  onRegionChange: (region: string) => void;
  onProvinceChange: (province: string) => void;
  onComuneChange: (comune: string) => void;
  onStradaChange: (strada: string) => void;
  onStatoChange: (stato: string) => void;
  loadingComuni?: boolean;
  loadingStrade?: boolean;
}

const AddressSelector = ({
  regioni,
  province,
  comuni,
  strade,
  selectedRegion,
  selectedProvince,
  selectedComune,
  selectedStrada,
  selectedStato,
  onRegionChange,
  onProvinceChange,
  onComuneChange,
  onStradaChange,
  onStatoChange,
  loadingComuni,
  loadingStrade,
}: AddressSelectorProps) => {

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '320px'
  };

  const selectStyle: React.CSSProperties = { 
    padding: '8px', 
    borderRadius: '4px', 
    border: '1px solid #ccc', 
    width: '100%',
    backgroundColor: '#fff',
    color: 'black'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    color: '#333',
    fontSize: '1.1rem'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #0056b3',
    background: '#0056b3',
    color: 'white',
    textDecoration: 'none',
    fontSize: '12px',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Filtra Dati</h3>
        <a href="/guida.html" target="_blank" rel="noopener noreferrer" style={buttonStyle}>
          Apri Guida
        </a>
      </div>
      <select style={selectStyle} value={selectedRegion} onChange={(e) => onRegionChange(e.target.value)}>
        <option value="">Seleziona Regione</option>
        {regioni.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      <select style={selectStyle} value={selectedProvince} onChange={(e) => onProvinceChange(e.target.value)} disabled={!selectedRegion}>
        <option value="">Seleziona Provincia</option>
        {province.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <select style={selectStyle} value={selectedComune} onChange={(e) => onComuneChange(e.target.value)} disabled={!selectedProvince}>
        <option value="">{loadingComuni ? 'Caricamento...' : 'Seleziona Comune'}</option>
        {comuni.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select style={selectStyle} value={selectedStrada} onChange={(e) => onStradaChange(e.target.value)} disabled={!selectedComune}>
        <option value="">Tutte le strade</option>
        {strade.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select style={selectStyle} value={selectedStato} onChange={(e) => onStatoChange(e.target.value)} disabled={!selectedComune}>
        <option value="">Tutti gli stati</option>
        <option value="A">Stato A</option>
        <option value="B">Stato B</option>
        <option value="C">Stato C</option>
        <option value="N/A">N/A</option>
      </select>
    </div>
  );
};

export default AddressSelector;