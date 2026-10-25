import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const INDIA = [20.5937, 78.9629];
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function ClickToPick({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function Recenter({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, zoom ?? Math.max(map.getZoom(), 16));
  }, [position?.[0], position?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Click the map to drop a pin. */
export function LocationPicker({ value, onPick }) {
  const position = value ? [value.lat, value.lng] : null;
  return (
    <MapContainer center={position || INDIA} zoom={position ? 16 : 5} className="map">
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      <ClickToPick onPick={onPick} />
      <Recenter position={position} />
      {position && <Marker position={position} />}
    </MapContainer>
  );
}

/** Read-only map with one pin. */
export function MapView({ lat, lng, small }) {
  const position = [lat, lng];
  return (
    <MapContainer center={position} zoom={16} scrollWheelZoom={false} className={small ? "map small" : "map"}>
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      <Marker position={position} />
    </MapContainer>
  );
}
