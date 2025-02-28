import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RoutingMachine({ start, end }) {
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
        show: false, // hide turn-by-turn instructions
      }).addTo(map);

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

    // Cleanup only on unmount
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, start, end]);

  return null;
}

export default RoutingMachine;
