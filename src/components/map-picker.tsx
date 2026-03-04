"use client";

import { useCallback, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet default icon fix for bundlers
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter: [number, number] = [41.0082, 28.9784]; // İstanbul

function ClickHandler({
  onSelect,
  position,
}: {
  onSelect: (lat: number, lng: number) => void;
  position: [number, number] | null;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return position ? (
    <Marker position={position} />
  ) : null;
}

export function MapPicker({
  initialLat,
  initialLng,
  onSelect,
}: {
  initialLat?: number | null;
  initialLng?: number | null;
  onSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(() => {
    if (initialLat != null && initialLng != null && !Number.isNaN(initialLat) && !Number.isNaN(initialLng)) {
      return [initialLat, initialLng];
    }
    return null;
  });

  const center: [number, number] = position ?? (initialLat != null && initialLng != null ? [initialLat, initialLng] : defaultCenter);

  const handleSelect = useCallback(() => {
    if (position) onSelect(position[0], position[1]);
  }, [position, onSelect]);

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[280px] w-full rounded-lg overflow-hidden border border-border z-0">
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={(lat, lng) => setPosition([lat, lng])} position={position} />
        </MapContainer>
      </div>
      {position && (
        <p className="text-xs text-muted-foreground">
          Enlem: {position[0].toFixed(5)}, Boylam: {position[1].toFixed(5)} — Bu konumu kullanmak için aşağıdaki butona tıklayın.
        </p>
      )}
      <button
        type="button"
        onClick={handleSelect}
        disabled={!position}
        className="rounded-md bg-gold px-3 py-2 text-sm font-medium text-gold-foreground hover:bg-gold/90 disabled:opacity-50 disabled:pointer-events-none"
      >
        Bu konumu kullan
      </button>
    </div>
  );
}
