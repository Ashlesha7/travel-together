import React, { useState, useEffect, useRef } from "react";

/**
 
 *  - value (string): current text value for the input
 *  - onChange (function): called when user types or selects a place
 *  - onSelect (function): called with { lat, lon, displayName } when user clicks a suggestion
 */
function OpenStreetMapAutocomplete({ value, onChange, onSelect }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  // Keep local inputValue in sync with external "value" prop
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Fetch suggestions from Nominatim when user types 3+ characters
  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
  
    const fetchSuggestions = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&email=np03cs4a220157@heraldcollege.edu.np&q=${encodeURIComponent(inputValue)}`;
        console.log("Fetching suggestions from:", url);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Suggestions received:", data);
        setSuggestions(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching OSM suggestions:", error);
        }
      }
    };
  
    fetchSuggestions();
    return () => {
      controller.abort();
    };
  }, [inputValue]);
  
  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value); // inform parent about changes
    setShowDropdown(true);
  };

  const handleSelect = (suggestion) => {
    // Use the 'display_name' from Nominatim
    const displayName = suggestion.display_name;
    setInputValue(displayName);
    onChange(displayName);
    setShowDropdown(false);

    // Provide lat/lon to the parent if needed
    if (onSelect) {
      onSelect({
        lat: suggestion.lat,
        lon: suggestion.lon,
        displayName,
      });
    }
  };

  const handleBlur = (e) => {
    //  hide the dropdown 
    if (!containerRef.current.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

  return (
    <div
      className="osm-autocomplete-container"
      ref={containerRef}
      onBlur={handleBlur}
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        placeholder="Type a location..."
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="osm-autocomplete-suggestions">
          {suggestions.map((sug) => (
            <li key={sug.place_id} onMouseDown={() => handleSelect(sug)}>
              {sug.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OpenStreetMapAutocomplete;
