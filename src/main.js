// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';

const map = new maplibregl.Map({
  container: "map",
  style:
    "https://api.maptiler.com/maps/streets-v2/style.json?key=G8Dm1IT5QuwmIf5bQtVr",
  center: [-123.0016, 49.2505], // BCIT Burnaby Campus
  zoom: 15,
});

// Get user location if browser supports geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLngLat = [position.coords.longitude, position.coords.latitude];

      // Center the map on user location
      map.setCenter(userLngLat);

      // Add a marker at the user location
      new maplibregl.Marker({ color: "#007bff" }) // blue marker
        .setLngLat(userLngLat)
        .setPopup(new maplibregl.Popup().setHTML("<b>You are here!</b>"))
        .addTo(map);

      // Optional: zoom in closer
      map.setZoom(16);
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Could not get your location.");
    }
  );
} else {
  alert("Geolocation is not supported by your browser.");
}

// Make the marker follow the user (live updates)
navigator.geolocation.watchPosition((position) => {
  const userLngLat = [position.coords.longitude, position.coords.latitude];
  map.setCenter(userLngLat);
});

// Add zoom and rotation controls
map.addControl(new maplibregl.NavigationControl(), "top-right");

// Add a marker for BCIT
new maplibregl.Marker({ color: "#ff0000" })
  .setLngLat([-123.0016, 49.2505])
  .setPopup(new maplibregl.Popup().setHTML("<b>BCIT Burnaby Campus</b>"))
  .addTo(map);
// document.addEventListener('DOMContentLoaded', sayHello);
