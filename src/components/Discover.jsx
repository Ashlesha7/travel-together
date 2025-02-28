import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// IMPORTANT: import the Leaflet Routing Machine library
import "leaflet-routing-machine";

import Navigation from "./Navigation";
import Footer from "./Footer";
import "./Discover.css";
import RoutingMachine from "./RoutingMachine";

// Fix Leaflet's default icon paths so markers appear correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Helper component to fit map bounds to all trips
function FitToTripsBounds({ trips }) {
  const map = useMap();

  useEffect(() => {
    if (!trips.length) return;
    const bounds = L.latLngBounds([]);
    trips.forEach((trip) => {
      if (trip.markerPosition) {
        bounds.extend([trip.markerPosition.lat, trip.markerPosition.lng]);
      }
      if (trip.startCoordinates) {
        bounds.extend([trip.startCoordinates.lat, trip.startCoordinates.lng]);
      }
      if (trip.endCoordinates) {
        bounds.extend([trip.endCoordinates.lat, trip.endCoordinates.lng]);
      }
    });
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trips, map]);

  return null;
}

// Helper component to fit map bounds to a single selected trip
function FitToSingleTrip({ trip }) {
  const map = useMap();

  useEffect(() => {
    if (!trip) return;
    const bounds = L.latLngBounds([]);
    if (trip.markerPosition) {
      bounds.extend([trip.markerPosition.lat, trip.markerPosition.lng]);
    }
    if (trip.startCoordinates) {
      bounds.extend([trip.startCoordinates.lat, trip.startCoordinates.lng]);
    }
    if (trip.endCoordinates) {
      bounds.extend([trip.endCoordinates.lat, trip.endCoordinates.lng]);
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trip, map]);

  return null;
}

const Discover = () => {
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  
  // Separate states: selectedTrip holds the currently chosen trip;
  // showModal controls the display of the trip details modal.
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch current user (for profile display)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/profile", {
          headers: { Authorization: token },
        })
        .then((res) => setUser(res.data))
        .catch((err) =>
          console.log("Not logged in or error fetching profile:", err)
        );
    }
  }, []);

  // Fetch all trip plans from the backend API (protected route)
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/trip-plans", {
        headers: { Authorization: token },
      })
      .then((res) => {
        setTrips(res.data);
        console.log("Fetched trips:", res.data);
      })
      .catch((err) => console.error("Error fetching trips:", err));
  }, []);

  // Filter trips based on search query (by destination, case-insensitive)
  const filteredTrips = trips.filter((trip) =>
    searchQuery.trim() === ""
      ? true
      : trip.destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to format date strings
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // "Connect" button handler – placeholder messaging
  const handleConnect = (trip) => {
    if (!user) {
      alert("Please log in to connect with this planner.");
      return;
    }
    alert(`Starting chat with ${trip.plannerName}...`);
  };

  // "Details" button handler – when a trip is selected, set it and show the modal.
  const handleDetails = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };

  // Close modal – set showModal false while keeping selectedTrip intact so that the route remains visible.
  const closeModal = () => {
    setShowModal(false);
    // Uncomment the next line if you want the route to disappear when modal closes:
    // setSelectedTrip(null);
  };

  return (
    <div className="discover-page">
      <Navigation user={user} />

      <div className="discover-content">
        {/* Left Column: Search bar and trip list */}
        <div className="trip-list">
          <h2 className="discover-title">Discover Trips</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="trip-cards">
            {filteredTrips.map((trip) => (
              <div key={trip._id} className="trip-card">
                <div className="trip-card-body">
                  <h3 className="trip-destination">{trip.destination}</h3>
                  <p className="trip-dates">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </p>
                  <div className="planner-info">
                    <img
                      src={
                        trip.plannerPhoto
                          ? `http://localhost:5000/${trip.plannerPhoto}`
                          : "https://via.placeholder.com/50"
                      }
                      alt={`${trip.plannerName || "Planner"}'s profile`}
                      className="planner-photo"
                    />
                    <span className="planner-name">
                      {trip.plannerName || "Unknown Planner"}
                    </span>
                  </div>
                </div>
                <div className="trip-card-buttons">
                  <button
                    className="connect-button"
                    onClick={() => handleConnect(trip)}
                  >
                    Connect
                  </button>
                  <button
                    className="details-button"
                    onClick={() => handleDetails(trip)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}

            {filteredTrips.length === 0 && (
              <p className="no-results">
                No trips found for "<span>{searchQuery}</span>"
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Interactive map */}
        <div className="discover-map">
          <MapContainer
            center={[28.3949, 84.124]}
            zoom={6}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selectedTrip ? (
              <FitToSingleTrip trip={selectedTrip} />
            ) : (
              <FitToTripsBounds trips={filteredTrips} />
            )}

            {/* Always render the RoutingMachine if a selected trip exists */}
            {selectedTrip && (
              <RoutingMachine
                start={selectedTrip.startCoordinates}
                end={selectedTrip.endCoordinates}
              />
            )}

            {/* Markers and simple polylines for non-selected trips */}
            {filteredTrips.map((trip) => {
              const elements = [];
              if (trip.markerPosition) {
                const { lat, lng } = trip.markerPosition;
                elements.push(
                  <Marker key={`${trip._id}-marker`} position={[lat, lng]} />
                );
              }
              if (!selectedTrip && trip.startCoordinates && trip.endCoordinates) {
                const { startCoordinates: start, endCoordinates: end } = trip;
                elements.push(
                  <Marker
                    key={`${trip._id}-start`}
                    position={[start.lat, start.lng]}
                  />
                );
                elements.push(
                  <Marker
                    key={`${trip._id}-end`}
                    position={[end.lat, end.lng]}
                  />
                );
                elements.push(
                  <Polyline
                    key={`${trip._id}-route`}
                    positions={[
                      [start.lat, start.lng],
                      [end.lat, end.lng],
                    ]}
                    pathOptions={{ color: "blue", weight: 3 }}
                  />
                );
              }
              return elements;
            })}
          </MapContainer>
        </div>
      </div>

      <Footer />

      {/* Modal for trip details */}
      {showModal && selectedTrip && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedTrip.destination}</h2>
            <p className="modal-dates">
              {formatDate(selectedTrip.startDate)} – {formatDate(selectedTrip.endDate)}
            </p>
            <p className="modal-planner">
              Planned by <strong>{selectedTrip.plannerName}</strong>
            </p>
            <p className="modal-description">
              {selectedTrip.shortDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
