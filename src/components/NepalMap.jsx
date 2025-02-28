import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./StartTrip.css";

// Plugins for geocoder & fullscreen
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet-control-geocoder";
import "leaflet.fullscreen";

// Fix default marker icon issue in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function GeocoderAndFullscreenControl({ onGeocode }) {
  const map = useMap();

  useEffect(() => {
    const geocoderControl = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        const latlng = e.geocode.center;
        if (onGeocode) onGeocode(latlng);
        map.fitBounds(e.geocode.bbox);
      })
      .addTo(map);

    L.control.fullscreen({ position: "topleft" }).addTo(map);

    return () => {
      geocoderControl.remove();
    };
  }, [map, onGeocode]);

  return null;
}

const NepalMap = ({ markerPosition, setMarkerPosition, onLocationSelect }) => {
  const defaultCenter = { lat: 28.3949, lng: 84.1240 };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMarkerPosition({ lat, lng });
    if (onLocationSelect) onLocationSelect({ lat, lng });
  };

  return (
    <div className="map-container">
      <MapContainer
        center={markerPosition || defaultCenter}
        zoom={7}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeocoderAndFullscreenControl
          onGeocode={(latlng) => {
            setMarkerPosition(latlng);
            if (onLocationSelect) onLocationSelect(latlng);
          }}
        />
        {markerPosition && <Marker position={markerPosition} />}
      </MapContainer>
    </div>
  );
};

export default NepalMap;
