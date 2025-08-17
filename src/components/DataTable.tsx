import React from 'react';

type CivicoConStrada = {
  strada: string;
  civico: string;
  barrato: string | null;
};

interface DataTableProps {
  civici: CivicoConStrada[];
  selectedCivico: CivicoConStrada | null;
  onCivicoSelect: (civico: CivicoConStrada) => void;
}

const barratoStatusMap: { [key: string]: string } = {
  A: 'Civico con scarsa qualità della coordinata',
  B: 'Civico entro 50m da reti > 300Mbit/s',
  C: 'Civico oltre 50m da reti > 300Mbit/s',
};

const getStatusDescription = (barrato: string | null) => {
  if (!barrato || barrato.trim() === '') return 'N/A';
  return barratoStatusMap[barrato] || 'Stato non definito';
};

const DataTable = ({ civici, selectedCivico, onCivicoSelect }: DataTableProps) => {
  if (!civici || civici.length === 0) {
    return <div className="data-table-container"><p style={{padding: '1rem'}}>Seleziona un comune per visualizzare i civici.</p></div>;
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Strada</th>
            <th>Civico</th>
            <th>Stato</th>
          </tr>
        </thead>
        <tbody>
          {civici.map((item, index) => (
            <tr 
              key={`${item.strada}-${item.civico}-${index}`}
              onClick={() => onCivicoSelect(item)}
              className={selectedCivico && selectedCivico.civico === item.civico && selectedCivico.strada === item.strada ? 'selected-row' : ''}
            >
              <td>{item.strada}</td>
              <td>{item.civico}</td>
              <td>{getStatusDescription(item.barrato)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
