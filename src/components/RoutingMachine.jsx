import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RoutingMachine({ start, end, instructionsRef }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Create the routing control only once
    if (!routingControlRef.current) {
      const control = L.Routing.control({
        waypoints: [],
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        lineOptions: { styles: [{ color: "blue", weight: 5 }] },
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: true, // Show turn-by-turn instructions
        container: instructionsRef.current, // Use the external container

        // Show markers only for first & last waypoints
        createMarker: (i, waypoint, n) => {
          if (i === 0 || i === n - 1) {
            return L.marker(waypoint.latLng);
          }
          return null;
        },
      }).addTo(map);

      // Patch _clearLines to check that _map exists before removing layers
      control._clearLines = function () {
        if (this._line && this._map) {
          this._map.removeLayer(this._line);
        }
        this._line = null;
      };

      control.on("routesfound", (e) => {
        console.log("Route found:", e.routes[0].coordinates);
      });

      routingControlRef.current = control;
    }

    // Update waypoints whenever start/end change
    if (start && end) {
      routingControlRef.current.setWaypoints([
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng),
      ]);
    } else {
      routingControlRef.current.setWaypoints([]);
    }

    // Cleanup on unmount
    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (error) {
          console.error("Error removing routing control:", error);
        }
        routingControlRef.current = null;
      }
    };
  }, [map, start, end, instructionsRef]);

  return null;
}

export default RoutingMachine;
