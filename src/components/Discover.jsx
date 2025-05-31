import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { useNavigate } from "react-router-dom"; // for navigation

import Navigation from "./Navigation";
import Footer from "./Footer";
import "./Discover.css"; 
import RoutingMachine from "./RoutingMachine";
import ReviewForm from "./ReviewForm";

// Fix Leaflet's default icon paths 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* 
  InvalidateMapSize Component 
  - Instead of using [map, ...dependencies], we explicitly list showModal, selectedTrip
    so ESLint can verify the dependency array.
*/
function InvalidateMapSize({ showModal, selectedTrip }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map, showModal, selectedTrip]);
  return null;
}

/* FitToTripsBounds: fits map to all trips */
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

/* FitToSingleTrip: fits map to a single trip */
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
  const [dateFilter, setDateFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [user, setUser] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // Ref to hold the external container for routing instructions
  const instructionsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch current user for profile display
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:8080/api/profile", {
          headers: { Authorization: token },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.log("Error fetching profile:", err));
    }
  }, []);

  // Fetch all trip plans
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/trip-plans", {
        headers: { Authorization: token },
      })
      .then((res) => {
        setTrips(res.data);
        console.log("Fetched trips:", res.data);
      })
      .catch((err) => console.error("Error fetching trips:", err));
  }, []);

  useEffect(() => {
    if (!selectedTrip || !user) {
      setCanReview(false);
      return;
    }
    const token = localStorage.getItem("token");
    axios
      .get(
        `http://localhost:8080/api/notifications/connection-status?otherUserId=${selectedTrip.user._id}`,
        { headers: { Authorization: token } }
      )
      .then((res) => setCanReview(res.data.connectionExists))  // true only if accepted
      .catch(() => setCanReview(false));
  }, [selectedTrip, user]);
  

  // Filtering logic: skip user's own trips, then check other filters
  const filteredTrips = trips.filter((trip) => {
    if (!user || !trip.user) return false;
    if (String(trip.user._id) === String(user._id)) return false;
    if (
      !searchQuery.trim() ||
      !trip.destination?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      if (filterDate < startDate || filterDate > endDate) return false;
    }
    if (genderFilter && trip.user.gender) {
      if (trip.user.gender.toLowerCase() !== genderFilter.toLowerCase()) return false;
    }
    if (ageFilter && trip.user.birthYear) {
      const currentYear = new Date().getFullYear();
      const birthDate = new Date(trip.user.birthYear);
      if (isNaN(birthDate)) return false;
      const userAge = currentYear - birthDate.getFullYear();
      if (userAge !== parseInt(ageFilter, 10)) return false;
    }
    return true;
  });

  // Format date strings
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  
  // 1. Checks if an accepted connection already exists.
  // 2. If yes, find or create a conversation, then navigate to /messages/:conversationId.
  // 3. Otherwise, send a new connection request notification.
  const handleConnect = (trip) => {
    if (!user) {
      alert("Please log in to connect with this planner.");
      return;
    }
    const token = localStorage.getItem("token");

    axios
      .get(
        `http://localhost:8080/api/notifications/connection-status?otherUserId=${trip.user._id}`,
        {
          headers: { Authorization: token },
        }
      )
      .then((res) => {
        if (res.data.connectionExists) {
          // If connection exists, find or create a conversation, then navigate to messaging page.
          axios
            .post(
              "http://localhost:8080/api/conversations/find-or-create",
              { 
                otherUserId: trip.user._id,
                tripPlanId: trip._id, 
              },
              { headers: { Authorization: token } }
            )
            .then((resp) => {
              const conversationId = resp.data._id;
              navigate(`/messages/${conversationId}`);
            })
            .catch((err) => {
              console.error("Error creating/finding conversation", err);
              alert("Error creating/finding conversation");
            });
        } else {
          // Otherwise, send a new connection request notification.
          const senderName = user.fullName;
          const receiverId = trip.user?._id;
          const receiverName = trip.user?.fullName || "Unknown Planner";
          axios
            .post(
              "http://localhost:8080/api/notifications/send",
              {
                senderId: user._id,
                senderName: senderName,
                receiverId: receiverId,
                type: "connectRequest",
                message: `${senderName} wants to connect with you.`,
                tripId: trip._id,
              },
              { headers: { Authorization: token } }
            )
            .then(() => {
              alert(`Notification sent to ${receiverName}`);
            })
            .catch((err) => {
              console.error("Error sending notification", err);
              alert("Error sending notification");
            });
        }
      })
      .catch((err) => {
        console.error("Error checking connection status", err);
        // Fallback: send the connection request.
        const senderName = user.fullName;
        const receiverId = trip.user?._id;
        const receiverName = trip.user?.fullName || "Unknown Planner";
        axios
          .post(
            "http://localhost:8080/api/notifications/send",
            {
              senderId: user._id,
              senderName: senderName,
              receiverId: receiverId,
              type: "connectRequest",
              message: `${senderName} wants to connect with you.`,
            },
            { headers: { Authorization: token } }
          )
          .then(() => {
            alert(`Notification sent to ${receiverName}`);
          })
          .catch((err) => {
            console.error("Error sending notification", err);
            alert("Error sending notification");
          });
      });
  };

  const handleDetails = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="discover-page">
      <Navigation user={user} />

      <div className="discover-content">
        {/*  Trip list */}
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
          {/* Filters */}
          <div className="advanced-filters">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Select Date"
            />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            <input
              type="number"
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              placeholder="Age"
            />
          </div>

          <div className="trip-cards">
            {filteredTrips.map((trip) => {
              const plannerPhoto = trip.user?.profilePhoto
                ? `http://localhost:8080/${trip.user.profilePhoto}`
                : "https://via.placeholder.com/50";
              const plannerName = trip.user?.fullName || "Unknown Planner";

              return (
                <div key={trip._id} className="trip-card">
                  <div className="trip-card-image-container">
                    <img
                      src={plannerPhoto}
                      alt={plannerName}
                      className="trip-card-image"
                    />
                  </div>
                  <div className="trip-card-content">
                    <h3 className="trip-card-planner">{plannerName}</h3>
                    <p className="trip-card-destination">
                      {trip.tripName || `Trip to ${trip.destination}`}
                    </p>
                    <p className="trip-card-dates">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </p>
                  </div>
                  <div className="trip-card-buttons">
                    <button
                      className="connect-button"
                      onClick={() => handleConnect(trip)}
                    >
                      {trip.status === "completed" ? "Connect" : "Connect"}
                    </button>
                    <button
                      className="details-button"
                      onClick={() => handleDetails(trip)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTrips.length === 0 && (
              <p className="no-results">
                No trips found for "<span>{searchQuery}</span>"
              </p>
            )}
          </div>
        </div>

        {/*  Map */}
        <div className="discover-map">
          <MapContainer
            center={[28.3949, 84.124]}
            zoom={6}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <InvalidateMapSize showModal={showModal} selectedTrip={selectedTrip} />
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selectedTrip ? (
              <>
                <FitToSingleTrip trip={selectedTrip} />
                <RoutingMachine
                  start={selectedTrip.startCoordinates}
                  end={selectedTrip.endCoordinates}
                  instructionsRef={instructionsRef}
                />
              </>
            ) : (
              <>
                <FitToTripsBounds trips={filteredTrips} />
                {filteredTrips.map((trip) => {
                  if (trip.markerPosition) {
                    const { lat, lng } = trip.markerPosition;
                    return (
                      <Marker
                        key={`${trip._id}-marker`}
                        position={[lat, lng]}
                      />
                    );
                  }
                  return null;
                })}
              </>
            )}
          </MapContainer>
          <div ref={instructionsRef} />
        </div>
      </div>

      <Footer />

      
      {showModal && selectedTrip && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content details-layout"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button and trip tiles */}
            <div className="details-header">
              <h2 className="details-destination">{selectedTrip.destination}</h2>
              <button
              className="close-modal"
              onClick={closeModal}
              aria-label="Close details"
              >
                &times;
              </button>
              </div>
              <p className="details-dates">
                {formatDate(selectedTrip.startDate)} – {formatDate(selectedTrip.endDate)}
              </p>


            {/* Two Columns */}
            <div className="details-columns">
              {/*  Trip Details */}
              <div className="details-left">
                <h3>Trip Details</h3>
                <ul>
                  <li>Destination: {selectedTrip.destination}</li>
                  <li>Meetup Location: {selectedTrip.meetupLocation || "N/A"}</li>
                </ul>
                {/* <h4>Meetup Point</h4> */}
                {/* <p>Connect with {selectedTrip.user?.fullName} to see this</p> */}
              </div>

              {/*  Creator Info */}
              <div className="details-right">
                <h3>Trip Created by {selectedTrip.user?.fullName}</h3>
                <img
                  src={
                    selectedTrip.user?.profilePhoto
                      ? `http://localhost:8080/${selectedTrip.user.profilePhoto}`
                      : "https://via.placeholder.com/80"
                  }
                  alt="Creator"
                  className="creator-photo"
                />
                <p><strong>Verified by Email</strong></p>
                <p><strong>Verified by Phone Number</strong></p>
              </div>
            </div>

            {/* Short Description */}
            <div className="details-description">
              <p>{selectedTrip.shortDescription}</p>
            </div>

            {/* ──────────────  REVIEW  ────────────── */}
            {canReview && selectedTrip.status === "completed" && !reviewDone && (
              <ReviewForm
              tripId={selectedTrip._id}
              revieweeId={selectedTrip.user._id}
              reviewerId={user._id}
              onSubmitted={() => {
                setReviewDone(true);
                alert("Thanks for reviewing your companion!");
               }}
               />
               )}
               {reviewDone && <p className="thanks-msg">Your review was submitted.</p>}


            {/* Connect Button + View Profile Buttons */}
            <div className="details-connect">
              <button
                className="connect-button"
                onClick={() => {
                  handleConnect(selectedTrip);
                }}
              >
                Connect
              </button>
              <button
                className="view-profile-button"
                onClick={() => {
                  navigate(`/profile/${selectedTrip.user._id}`);
                }}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
