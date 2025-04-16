import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; 
import Navigation from "./Navigation";
import NepalMap from "./NepalMap";
import "./StartTrip.css";
import Footer from "./Footer";


import roadTripImg from "../assets/roadTrip.jpg";
import adventureImg from "../assets/adventure.jpg";
import citiesImg from "../assets/cities.jpg";


import iconLocation from "../assets/location.png";


import OpenStreetMapAutocomplete from "./OpenStreetMapAutocomplete";


import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarInput from "./CalendarInput";

const StartTrip = () => {
  // Trip type (Road Trip, Adventure Travel, Explore Cities)
  const [tripType, setTripType] = useState("");

  // Form fields
  const [currentLocation, setCurrentLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");

  // "Name Your Trip" and "Short description of your trip"
  const [tripName, setTripName] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Date fields
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Marker on the map
  const [markerPosition, setMarkerPosition] = useState(null);

  // to control the location modal
  const [showLocationModal, setShowLocationModal] = useState(false);

  //  to control the "See samples" modal
  const [showSamplesModal, setShowSamplesModal] = useState(false);

  // Profile fetching 
  const [user, setUser] = useState(null);

  //START-END COORDINATES FOR ROUTE VISUALIZATION 
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [endCoordinates, setEndCoordinates] = useState(null);


  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axios.get("http://localhost:8080/api/profile", {
            headers: { Authorization: token },
          });
          setUser(res.data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
    setShowLocationModal(true);
  }, []);

  // Handle "Yes" (user agrees to share location)
  const handleUseLocation = () => {
    setShowLocationModal(false);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            if (data && data.display_name) {
              setCurrentLocation(data.display_name);
            } else {
              setCurrentLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            setCurrentLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  // Handle "No" (user does NOT agree to share location)
  const handleNoLocation = () => {
    setShowLocationModal(false);
  };

  //  handleSubmit: after validation, POST trip plan data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) Check if tripType is selected
    if (!tripType) {
      alert("Please select a trip type (Road Trip, Adventure Travel, or Explore Cities).");
      return;
    }

    // 2) Check if tripName is filled
    if (!tripName.trim()) {
      alert("Please fill out the 'Name Your Trip' field.");
      return;
    }

    // 3) Check if shortDescription is filled
    if (!shortDescription.trim()) {
      alert("Please fill out the 'Short description of your trip' field.");
      return;
    }

    // 4) Check if currentLocation is filled
    if (!currentLocation.trim()) {
      alert("Please fill out the 'Where are you now?' field.");
      return;
    }

    // 5) Check if destination is filled
    if (!destination.trim()) {
      alert("Please fill out the 'Where are you going?' field.");
      return;
    }

    // 6) Check if dates are selected
    if (!startDate) {
      alert("Please select a start date.");
      return;
    }
    if (!endDate) {
      alert("Please select an end date.");
      return;
    }

    // 7) Check if meetupLocation is filled
    if (!meetupLocation.trim()) {
      alert("Please fill out the 'Meetup Point' field.");
      return;
    }

    // Create the trip plan object
    const tripData = {
      tripType,
      tripName,
      shortDescription,
      currentLocation,
      destination,
      meetupLocation,
      startDate,
      endDate,
      markerPosition,
      startCoordinates, 
      endCoordinates,   
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to publish a trip.");
        return;
      }
      const res = await axios.post("http://localhost:8080/api/trip-plans", tripData, {
        headers: { Authorization: token },
      });
      console.log("Trip plan created:", res.data);
      alert("Trip info submitted successfully!");
    } catch (error) {
      console.error("Error creating trip plan:", error.response?.data);
      alert(error.response?.data?.msg || "Submission failed. Please try again.");
    }
  };

  return (
    <div className="start-trip-page">
      {/* Pass user data to Navigation so profile photo appears */}
      <Navigation user={user} />

      {/* Location Modal */}
      {showLocationModal && (
        <div className="location-modal-overlay">
          <div className="location-modal">
            <h2>Use Your Live Location?</h2>
            <p>
              Would you like to let us automatically fill in your current
              location using your device's GPS?
            </p>
            <div className="modal-buttons">
              <button onClick={handleUseLocation} className="yes-button">
                Yes
              </button>
              <button onClick={handleNoLocation} className="no-button">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Samples Modal for "See samples" */}
      {showSamplesModal && (
        <div className="location-modal-overlay">
          <div className="location-modal">
            <h2>Sample Trip Descriptions</h2>
            <p>• A thrilling 3-day hike across the majestic Himalayan foothills.</p>
            <p>• A relaxing weekend getaway exploring historical sites and local culture.</p>
            <p>• A foodie adventure discovering hidden restaurants and street food.</p>
            <button onClick={() => setShowSamplesModal(false)} className="yes-button">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="start-trip-content">
        {/* Title: "What type of trip are you planning?" */}
        <h2 className="trip-type-title">What type of trip you are planning?</h2>
        <div className="trip-type-options">
          <div
            className={`trip-type-option ${tripType === "Road Trip" ? "active" : ""}`}
            onClick={() => setTripType("Road Trip")}
          >
            <img src={roadTripImg} alt="Road Trip" />
            <p>Road Trip</p>
          </div>
          <div
            className={`trip-type-option ${tripType === "Adventure Travel" ? "active" : ""}`}
            onClick={() => setTripType("Adventure Travel")}
          >
            <img src={adventureImg} alt="Adventure Travel" />
            <p>Adventure Travel</p>
          </div>
          <div
            className={`trip-type-option ${tripType === "Explore Cities" ? "active" : ""}`}
            onClick={() => setTripType("Explore Cities")}
          >
            <img src={citiesImg} alt="Explore Cities" />
            <p>Explore Cities</p>
          </div>
        </div>

        {/* Name Your Trip */}
        <div className="form-group">
          <label>Name Your Trip</label>
          <input
            className="plain-input"
            type="text"
            placeholder="A multi-day trip to know the unknown"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            required
          />
        </div>

        {/* Short description of your trip */}
        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center" }}>
            Short description of your trip
            <span
              style={{
                marginLeft: "8px",
                fontSize: "0.8rem",
                color: "#2C3C30",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => setShowSamplesModal(true)}
            >
              See samples
            </span>
          </label>
          <textarea
            className="plain-textarea"
            placeholder="Write short description of your trip..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows="4"
            required
          />
        </div>

        <form className="start-trip-form" onSubmit={handleSubmit}>
          {/* Where are you now? */}
          <div className="form-group">
            <label>Where are you now ?</label>
            <div className="icon-input">
              <div className="icon-block">
                <img src={iconLocation} alt="Location Icon" />
              </div>
              {/* <OpenStreetMapAutocomplete
                value={currentLocation}
                onChange={(val) => setCurrentLocation(val)}
                onSelect={(locData) => {
                  setCurrentLocation(locData.display_name || locData.displayName);
                  setMarkerPosition({
                    lat: parseFloat(locData.lat),
                    lng: parseFloat(locData.lon),
                  });
                }}
              /> */}
              <OpenStreetMapAutocomplete
              value={currentLocation}
              onChange={(val) => setCurrentLocation(val)}
              onSelect={(locData) => {
                const pos = {
                  lat: parseFloat(locData.lat),
                  lng: parseFloat(locData.lon),
                };
                setCurrentLocation(locData.display_name || locData.displayName);
                setMarkerPosition(pos);
                //setStartCoordinates(pos); 
                 }}
                 />

            </div>
          </div>

          {/* Where are you going? */}
          <div className="form-group">
            <label>Where are you going ?</label>
            <div className="icon-input">
              <div className="icon-block">
                <img src={iconLocation} alt="Location Icon" />
              </div>
              {/* <OpenStreetMapAutocomplete
                value={destination}
                onChange={(val) => setDestination(val)}
                onSelect={(locData) => {
                  setDestination(locData.display_name || locData.displayName);
                }}
              /> */}
              <OpenStreetMapAutocomplete
              value={destination}
              onChange={(val) => setDestination(val)}
              onSelect={(locData) => {
                const pos = {
                  lat: parseFloat(locData.lat),
                  lng: parseFloat(locData.lon),
                };
                setDestination(locData.display_name || locData.displayName);
                setEndCoordinates(pos); // Store as endCoordinates
                 }}
                 />

            </div>
          </div>

          {/* When are you planning to go? */}
          <div className="form-group date-group">
            <label>When are you planning to go ?</label>
            <div className="date-inputs">
              <ReactDatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Select start date"
                customInput={<CalendarInput />}
              />
              <span>To</span>
              <ReactDatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="Select end date"
                customInput={<CalendarInput />}
              />
            </div>
          </div>

          {/* Meetup Point Field */}
          <div className="form-group">
            <label>Meetup Point</label>
            <div className="icon-input">
              <div className="icon-block">
                <img src={iconLocation} alt="Location Icon" />
              </div>
              <OpenStreetMapAutocomplete
                value={meetupLocation}
                onChange={(val) => setMeetupLocation(val)}
                onSelect={(locData) => {
                  //setMeetupLocation(locData.display_name || locData.displayName);
                  const pos = {
                  //setMarkerPosition({
                    lat: parseFloat(locData.lat),
                    lng: parseFloat(locData.lon),
                  };
                  setMeetupLocation(locData.display_name || locData.displayName);
                  setMarkerPosition(pos);
                  setStartCoordinates(pos); 
                }}
              />
            </div>
          </div>

          {/* Map for selecting / displaying Meetup Point */}
          <h3>Meetup Point on Map</h3>
          <p>
            Type a location above or click on the map to set your meetup point.
          </p>
          <NepalMap
            markerPosition={markerPosition}
            setMarkerPosition={setMarkerPosition}
            onLocationSelect={(latlng) => setMarkerPosition(latlng)}
          />
          {markerPosition && (
            <div className="selected-location">
              <p>
                Selected Location: Latitude: {markerPosition.lat.toFixed(4)},
                Longitude: {markerPosition.lng.toFixed(4)}
              </p>
            </div>
          )}

          <button type="submit" className="start-trip-button">
            Publish
          </button>
        </form>

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default StartTrip;
