'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Type definitions
type LatLngTuple = [number, number];
type Civico = { civico: string; stato: string | null; };

interface MapProps {
  center: LatLngTuple;
  markerPosition: LatLngTuple | null;
  zoom: number;
  selectedCivico: Civico | null;
}

// Component to programmatically change the map's view
function ChangeView({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Helper to get color based on status
const getColorForStato = (stato: string | null): string => {
  switch (stato) {
    case 'A': return 'red';
    case 'B': return 'green';
    case 'C': return 'yellow';
    default: return 'gray';
  }
};

const Map = ({ center, markerPosition, zoom, selectedCivico }: MapProps) => {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100vh', width: '100%' }}>
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markerPosition && selectedCivico && (
        <CircleMarker
          center={markerPosition}
          radius={8}
          pathOptions={{ color: getColorForStato(selectedCivico.stato), fillColor: getColorForStato(selectedCivico.stato), fillOpacity: 0.8 }}
        >
          <Popup>
            Civico: {selectedCivico.civico}
          </Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
};

export default Map;
