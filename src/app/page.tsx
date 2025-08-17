'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import AddressSelector from '@/components/AddressSelector';
import DataTable from '@/components/DataTable';
import Legend from '@/components/Legend';

// Type definitions
type Civico = { civico: string; barrato: string | null; };
type CivicoConStrada = { strada: string; civico: string; barrato: string | null; };
type RegioniProvince = { [key: string]: string[]; };

const ITALY_CENTER: [number, number] = [41.9027835, 12.4963655];

export default function Home() {
  const Map = useMemo(() => dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' }}><h4>Caricamento mappa...</h4></div>,
  }), []);

  // State variables
  const [regioni, setRegioni] = useState<string[]>([]);
  const [province, setProvince] = useState<string[]>([]);
  const [comuni, setComuni] = useState<string[]>([]);
  const [strade, setStrade] = useState<string[]>([]);
  
  const [allCivici, setAllCivici] = useState<CivicoConStrada[]>([]);
  const [civiciInTabella, setCiviciInTabella] = useState<CivicoConStrada[]>([]);
  const [selectedCivico, setSelectedCivico] = useState<CivicoConStrada | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [regioniProvinceData, setRegioniProvinceData] = useState<RegioniProvince>({});
  
  // Map states
  const [mapCenter, setMapCenter] = useState<[number, number]>(ITALY_CENTER);
  const [mapZoom, setMapZoom] = useState(6);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  // Selection & Filter states
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedComune, setSelectedComune] = useState('');
  const [selectedStrada, setSelectedStrada] = useState('');
  const [selectedStato, setSelectedStato] = useState('');

  useEffect(() => {
    fetch('/data/regioni_province.json').then(res => res.json()).then(data => {
      setRegioniProvinceData(data);
      setRegioni(Object.keys(data));
    }).catch(err => console.error('Failed to fetch regioni_province.json:', err));
  }, []);

  // Centralized filtering logic
  useEffect(() => {
    let filteredData = allCivici;
    if (selectedStrada) { filteredData = filteredData.filter(c => c.strada === selectedStrada); }
    if (selectedStato) {
      if (selectedStato === 'N/A') {
        filteredData = filteredData.filter(c => !c.barrato || c.barrato.trim() === '');
      } else {
        filteredData = filteredData.filter(c => c.barrato === selectedStato);
      }
    }
    setCiviciInTabella(filteredData);
  }, [selectedStrada, selectedStato, allCivici]);

  // Geocoding function for map view changes
  const geocodeAndSetView = async (locationName: string, zoomLevel: number) => {
    setLoading(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapZoom(zoomLevel);
      }
    } catch (error) {
      console.error("Geocoding for view change failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetSelections = (level: 'regione' | 'provincia' | 'comune') => {
    if (level === 'regione') { setSelectedProvince(''); }
    if (level === 'regione' || level === 'provincia') { setSelectedComune(''); }
    setSelectedStrada('');
    setSelectedStato('');
    setAllCivici([]);
    setStrade([]);
    setSelectedCivico(null);
    setMarkerPosition(null);
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setProvince(regioniProvinceData[region] || []);
    resetSelections('regione');
    if (region) {
      geocodeAndSetView(`${region}, Italy`, 8);
    } else {
      setMapCenter(ITALY_CENTER);
      setMapZoom(6);
    }
  };

  const handleProvinceChange = async (province: string) => {
    setSelectedProvince(province);
    resetSelections('provincia');
    if (province) {
      geocodeAndSetView(`${province}, ${selectedRegion}, Italy`, 10);
      const provKey = province.toUpperCase().replace(/[^A-Z0-9_\-]/g, '_');
      fetch(`/data/comuni/${provKey}.json`).then(res => res.json()).then(setComuni)
        .catch(() => setComuni([]));
    }
  };

  const handleComuneChange = async (comune: string) => {
    setSelectedComune(comune);
    resetSelections('comune');
    if (comune && selectedProvince) {
      geocodeAndSetView(`${comune}, ${selectedProvince}, Italy`, 13);
      const comKey = `${selectedProvince}_${comune}`.toUpperCase().replace(/[^A-Z0-9_\-]/g, '_');
      try {
        const response = await fetch(`/data/strade/${comKey}.json`);
        const data = await response.json();
        const stradeNomi = Object.keys(data).sort();
        setStrade(stradeNomi);
        const aggregatedCivici: CivicoConStrada[] = [];
        for (const strada of stradeNomi) {
          const civiciPerStrada: Civico[] = data[strada];
          civiciPerStrada.forEach(civico => { aggregatedCivici.push({ ...civico, strada }); });
        }
        setAllCivici(aggregatedCivici);
      } catch (error) { console.error('Failed to fetch strade data:', error); }
    }
  };

  const handleStradaChange = (strada: string) => {
    setSelectedStrada(strada);
    setSelectedCivico(null);
    setMarkerPosition(null);
  };

  const handleStatoChange = (stato: string) => {
    setSelectedStato(stato);
    setSelectedCivico(null);
    setMarkerPosition(null);
  };

  const handleCivicoSelect = async (civico: CivicoConStrada) => {
    setSelectedCivico(civico);
    setLoading(true);
    setMarkerPosition(null);
    const address = `${civico.civico}, ${civico.strada}, ${selectedComune}, ${selectedProvince}, Italy`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter(newPos);
        setMarkerPosition(newPos);
        setMapZoom(18);
      } else {
        alert('Indirizzo non trovato.');
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert('Errore during la ricerca dell\'indirizzo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div className="map-wrapper">
        <Map 
          center={mapCenter} 
          markerPosition={markerPosition} 
          zoom={mapZoom} 
          selectedCivico={selectedCivico} 
        />
        <AddressSelector
          regioni={regioni}
          province={province}
          comuni={comuni}
          strade={strade}
          selectedRegion={selectedRegion}
          selectedProvince={selectedProvince}
          selectedComune={selectedComune}
          selectedStrada={selectedStrada}
          selectedStato={selectedStato}
          onRegionChange={handleRegionChange}
          onProvinceChange={handleProvinceChange}
          onComuneChange={handleComuneChange}
          onStradaChange={handleStradaChange}
          onStatoChange={handleStatoChange}
        />
        <Legend />
        {loading && <div className="loading-overlay"><h4>Ricerca coordinate...</h4></div>}
      </div>
      <div className="table-wrapper">
        <DataTable civici={civiciInTabella} selectedCivico={selectedCivico} onCivicoSelect={handleCivicoSelect} />
      </div>
    </main>
  );
}