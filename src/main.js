import { db } from "/src/firebaseConfig.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

// Get API key from environment variable
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

// Load "Last Updated" timestamp from Firebase
async function loadLastUpdated() {
  const ref = doc(db, "meta", "lastUpdated");
  const snap = await getDoc(ref);

  const display = document.getElementById("lastUpdatedDisplay");

  if (snap.exists()) {
    const ts = snap.data().time.toDate();
    display.textContent = "Last updated: " + ts.toLocaleString();
  } else {
    display.textContent = "Last updated: unknown";
  }
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing map...");

  // Load the last updated timestamp
  loadLastUpdated();

  const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
    center: [-123.0016, 49.2505], // BCIT Burnaby Campus
    zoom: 15,
  });

  let userMarker = null;
  let searchMarker = null;
  let currentUserLocation = null;
  let parkingMarkers = [];

  const parkingLocations = [
    {
      id: "A",
      name: "BCIT Parking Lot A",
      center: [-122.99837292626391, 49.252050801096035],
      radius: 80,
      reports: [],
    },
    {
      id: "B",
      name: "BCIT Parking Lot B",
      center: [-122.99830913222692, 49.25105744299303],
      radius: 80,
      reports: [],
    },
    {
      id: "D",
      name: "BCIT Parking Lot D",
      center: [-122.99917571760426, 49.24816286829297],
      radius: 80,
      reports: [],
    },
    {
      id: "E/F",
      name: "BCIT Parking Lot E/F",
      center: [-122.99917964985744, 49.24717712468893],
      radius: 70,
      reports: [],
      status: "closed", // Closed for construction
    },
    {
      id: "L",
      name: "BCIT Parking Lot L",
      center: [-123.00086542868452, 49.24504495669218],
      radius: 80,
      reports: [],
    },
    {
      id: "M/N",
      name: "BCIT Parking Lot M/N",
      center: [-123.0023070002376, 49.24485785029364],
      radius: 90,
      reports: [],
    },
    {
      id: "Q",
      name: "BCIT Parking Lot Q",
      center: [-123.00290493253136, 49.25422731483849],
      radius: 80,
      reports: [],
    },
    {
      id: "5",
      name: "BCIT Parking Lot 5",
      center: [-123.00056274604528, 49.25036650243376],
      radius: 70,
      reports: [],
    },
    {
      id: "7",
      name: "BCIT Parking Lot 7 (Staff)",
      center: [-122.99929999762627, 49.249023340019455],
      radius: 70,
      reports: [],
    },
    {
      id: "12",
      name: "BCIT Parking Lot 12",
      center: [-122.99929066685925, 49.24992438097292],
      radius: 70,
      reports: [],
    },
  ];

  function getMarkerColor(location) {
    // If parking lot is closed, show orange
    if (location.status === "closed") {
      return "#f59e0b"; // Orange for closed
    }

    if (location.reports.length === 0) return "#808080"; // Gray - no data

    // Only consider reports from last 30 minutes
    const now = Date.now();
    const recentReports = location.reports.filter(
      (r) => now - r.timestamp < 30 * 60 * 1000
    );

    if (recentReports.length === 0) return "#808080";

    // Count report types
    const available = recentReports.filter(
      (r) => r.status === "available"
    ).length;
    const full = recentReports.filter((r) => r.status === "full").length;

    // Simple majority vote
    if (available > full) {
      return "#22c55e"; // Green - Available
    } else {
      return "#ef4444"; // Red - Full
    }
  }

  function drawParkingZones() {
    map.on("load", () => {
      parkingLocations.forEach((location) => {
        const sourceId = `parking-${location.id}`;
        const layerId = `parking-layer-${location.id}`;

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: location.center,
            },
            properties: {
              name: location.name,
              id: location.id,
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 20,
            "circle-color": getMarkerColor(location),
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        map.addLayer({
          id: `${layerId}-text`,
          type: "symbol",
          source: sourceId,
          layout: {
            "text-field": location.id,
            "text-size": 14,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        map.on("click", layerId, () => {
          if (location.status === "closed") {
            alert(`${location.name} is currently closed for construction.`);
          } else {
            showReportModal(location);
          }
        });

        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });

        parkingMarkers.push({ location, layerId });
      });
      listenForUpdates();
    });
  }
  function listenForUpdates() {
    const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;

    const q = query(
      collection(db, "reports"),
      where("timestamp", ">", thirtyMinsAgo)
    );

    onSnapshot(q, (snapshot) => {
      console.log("Received update from Firebase");

      parkingLocations.forEach((loc) => (loc.reports = []));

      snapshot.forEach((doc) => {
        const data = doc.data();
        const parkingLot = parkingLocations.find(
          (p) => p.id === data.locationId
        );

        if (parkingLot) {
          parkingLot.reports.push({
            status: data.status,
            timestamp: data.timestamp,
          });
        }
      });

      parkingLocations.forEach((loc) => {
        if (map.getLayer(`parking-layer-${loc.id}`)) {
          updateZoneAppearance(loc.id);
        }
      });
    });
  }
  function updateZoneAppearance(locationId) {
    const markerObj = parkingMarkers.find((m) => m.location.id === locationId);
    if (!markerObj) return;

    const color = getMarkerColor(markerObj.location);
    map.setPaintProperty(markerObj.layerId, "circle-color", color);
  }

  function showReportModal(location) {
    document.getElementById(
      "modalLocationName"
    ).textContent = `Are parking spots available at ${location.name}?`;
    document.getElementById("reportModal").style.display = "flex";

    window.currentReportLocation = location;
  }

  window.submitReport = async function (status) {
    const location = window.currentReportLocation;
    if (!location) return;

    const reportModal = document.getElementById("reportModal");

    reportModal.style.display = "none";

    try {
      await addDoc(collection(db, "reports"), {
        locationId: location.id,
        locationName: location.name,
        status: status,
        timestamp: Date.now(),
        userId: "user123",
      });

      alert(`Thanks! You reported ${location.name} as ${status}.`);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error submitting report. Please try again.");
    }
  };
  function checkNearbyZones(userLng, userLat) {
    parkingLocations.forEach((location) => {
      // Skip closed parking lots
      if (location.status === "closed") return;

      const distance = getDistance(
        userLng,
        userLat,
        location.center[0],
        location.center[1]
      );

      // If user is within zone radius, prompt for report (only once per 10 minutes)
      if (distance < location.radius) {
        const lastPrompt = sessionStorage.getItem(`lastPrompt-${location.id}`);
        const now = Date.now();

        if (!lastPrompt || now - parseInt(lastPrompt) > 10 * 60 * 1000) {
          sessionStorage.setItem(`lastPrompt-${location.id}`, now.toString());
          setTimeout(() => showReportModal(location), 2000);
        }
      }
    });
  }

  function getDistance(lng1, lat1, lng2, lat2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  drawParkingZones();

  // Add zoom & rotation controls
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  // Add BCIT marker
  new maplibregl.Marker({ color: "#ff0000" })
    .setLngLat([-123.0016, 49.2505])
    .setPopup(new maplibregl.Popup().setHTML("<b>BCIT Burnaby Campus</b>"))
    .addTo(map);

  // Locate Me Button functionality
  const locateBtn = document.getElementById("locateBtn");
  console.log("Locate button:", locateBtn);

  locateBtn.addEventListener("click", () => {
    console.log("Locate button clicked");
    locateBtn.style.opacity = "0.6";
    setTimeout(() => (locateBtn.style.opacity = "1"), 200);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLngLat = [
            position.coords.longitude,
            position.coords.latitude,
          ];

          // Store current user location
          currentUserLocation = userLngLat;

          if (userMarker) userMarker.remove();

          userMarker = new maplibregl.Marker({ color: "#007bff" })
            .setLngLat(userLngLat)
            .setPopup(new maplibregl.Popup().setHTML("<b>You are here!</b>"))
            .addTo(map);

          map.flyTo({
            center: userLngLat,
            zoom: 16,
            duration: 1500,
          });

          // Check if user is near any parking zones
          checkNearbyZones(userLngLat[0], userLngLat[1]);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not get your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  });

  // Optional: Watch user position continuously for automatic prompts
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const userLngLat = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        currentUserLocation = userLngLat;

        // Update user marker if it exists
        if (userMarker) {
          userMarker.setLngLat(userLngLat);
        }

        // Continuously check for nearby zones
        checkNearbyZones(userLngLat[0], userLngLat[1]);
      },
      (error) => {
        console.log("Watch position error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // Cache position for 10 seconds
        timeout: 5000,
      }
    );
  }

  // Home Button functionality
  const homeIcon = document.querySelector(".home-icon");
  console.log("Home icon:", homeIcon);

  homeIcon.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Home button clicked");

    // Fly back to BCIT
    map.flyTo({
      center: [-123.0016, 49.2505],
      zoom: 15,
      duration: 1500,
    });
  });

  // ========== Search Feature ==========
  const searchBtn = document.getElementById("searchBtn");
  const searchModal = document.getElementById("searchModal");
  const closeModal = document.getElementById("closeModal");
  const locationInput = document.getElementById("locationInput");
  const searchResults = document.getElementById("searchResults");

  console.log("Search button:", searchBtn);
  console.log("Search modal:", searchModal);

  searchBtn.addEventListener("click", () => {
    console.log("Search button clicked!");
    searchModal.style.display = "flex";
    locationInput.focus();
  });

  closeModal.addEventListener("click", () => {
    searchModal.style.display = "none";
    locationInput.value = "";
    searchResults.innerHTML = "";
  });

  searchModal.addEventListener("click", (e) => {
    if (e.target === searchModal) {
      searchModal.style.display = "none";
      locationInput.value = "";
      searchResults.innerHTML = "";
    }
  });

  let searchTimeout;
  locationInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 3) {
      searchResults.innerHTML = "";
      return;
    }

    searchTimeout = setTimeout(() => {
      searchLocation(query);
    }, 500);
  });

  async function searchLocation(query) {
    try {
      searchResults.innerHTML =
        '<div style="text-align: center; padding: 20px; color: #666;">Searching...</div>';

      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          query
        )}.json?key=${MAPTILER_KEY}&proximity=-123.0016,49.2505`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        displayResults(data.features);
      } else {
        searchResults.innerHTML =
          '<div style="text-align: center; padding: 20px; color: #666;">No results found</div>';
      }
    } catch (error) {
      console.error("Search error:", error);
      searchResults.innerHTML =
        '<div style="text-align: center; padding: 20px; color: #666;">Error searching. Please try again.</div>';
    }
  }

  function displayResults(features) {
    searchResults.innerHTML = "";

    features.forEach((feature) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";

      const name = document.createElement("div");
      name.className = "result-name";
      name.textContent = feature.text || feature.place_name;

      const address = document.createElement("div");
      address.className = "result-address";
      address.textContent = feature.place_name;

      resultItem.appendChild(name);
      resultItem.appendChild(address);

      resultItem.addEventListener("click", () => {
        goToLocation(feature);
      });

      searchResults.appendChild(resultItem);
    });
  }

  function goToLocation(feature) {
    const [lng, lat] = feature.center;

    if (searchMarker) searchMarker.remove();

    searchMarker = new maplibregl.Marker({ color: "#22c55e" })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup().setHTML(`<b>${feature.place_name}</b>`))
      .addTo(map);

    map.flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 2000,
    });

    searchMarker.togglePopup();
    searchModal.style.display = "none";
    locationInput.value = "";
    searchResults.innerHTML = "";
  }

  // Close report modal functionality
  document.getElementById("closeReportModal").addEventListener("click", () => {
    document.getElementById("reportModal").style.display = "none";
  });
});
