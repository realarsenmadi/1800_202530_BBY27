// main.js
import { db, auth } from "/src/firebaseConfig.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Get API key from environment variable
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const lastUpdatedDisplay = document.getElementById("lastUpdatedDisplay");
  const mapContainer = document.getElementById("map");
  const locateBtn = document.getElementById("locateBtn");
  const homeIcon = document.querySelector(".home-icon");
  const searchBtn = document.getElementById("searchBtn");
  const searchModal = document.getElementById("searchModal");
  const closeModal = document.getElementById("closeModal");
  const locationInput = document.getElementById("locationInput");
  const searchResults = document.getElementById("searchResults");
  const favouritesModal = document.getElementById("favouritesModal");
  const closeFavourites = document.getElementById("closeFavourites");
  const favouritesList = document.getElementById("favouritesList");
  const openFavourites = document.getElementById("openFavourites");

  const filterIcon = document.querySelector(".filter-icon");
  const filterModal = document.getElementById("filterModal");
  const closeFilterModal = document.getElementById("closeFilterModal");
  const applyFilterBtn = document.getElementById("applyFilter");
  const clearFilterBtn = document.getElementById("clearFilter");

  let currentFilter = null;

  function applyParkingFilter(filter) {
    currentFilter = filter;

    parkingLocations.forEach((location) => {
      const layerId = `parking-layer-${location.id}`;
      const textLayerId = `${layerId}-text`;

      if (!map.getLayer(layerId)) return;

      const color = getMarkerColor(location);
      let shouldShow = true;

      if (filter === "available") {
        shouldShow = color === "#22c55e";
      } else if (filter === "full") {
        shouldShow = color === "#ef4444";
      }

      map.setLayoutProperty(
        layerId,
        "visibility",
        shouldShow ? "visible" : "none"
      );
      map.setLayoutProperty(
        textLayerId,
        "visibility",
        shouldShow ? "visible" : "none"
      );
    });
  }

  filterIcon.addEventListener("click", () => {
    filterModal.style.display = "flex";
  });

  closeFilterModal.addEventListener("click", () => {
    filterModal.style.display = "none";
  });

  filterModal.addEventListener("click", (e) => {
    if (e.target === filterModal) {
      filterModal.style.display = "none";
    }
  });

  applyFilterBtn.addEventListener("click", () => {
    const selectedFilter = document.querySelector(
      'input[name="parkingFilter"]:checked'
    );
    if (selectedFilter) {
      applyParkingFilter(selectedFilter.value);
      filterModal.style.display = "none";
    }
  });

  clearFilterBtn.addEventListener("click", () => {
    applyParkingFilter(null);
    document
      .querySelectorAll('input[name="parkingFilter"]')
      .forEach((radio) => {
        radio.checked = false;
      });
    filterModal.style.display = "none";
  });

  function updateZoneAppearance(locationId) {
    const markerObj = parkingMarkers.find((m) => m.location.id === locationId);
    if (!markerObj) return;

    const color = getMarkerColor(markerObj.location);
    map.setPaintProperty(markerObj.layerId, "circle-color", color);

    if (currentFilter) {
      let shouldShow = true;

      if (currentFilter === "available") {
        shouldShow = color === "#22c55e";
      } else if (currentFilter === "full") {
        shouldShow = color === "#ef4444";
      }

      map.setLayoutProperty(
        markerObj.layerId,
        "visibility",
        shouldShow ? "visible" : "none"
      );
      map.setLayoutProperty(
        `${markerObj.layerId}-text`,
        "visibility",
        shouldShow ? "visible" : "none"
      );
    }
  }
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

  let userMarker = null;
  let searchMarker = null;
  let currentUserLocation = null;
  let parkingMarkers = [];

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

    const modal = document.getElementById("reportModal");
    modal.classList.add("active");

    window.currentReportLocation = location;
  }

  async function handleReportSubmission(status) {
    const location = window.currentReportLocation;
    if (!location) return;

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to submit a report!");
      return;
    }
    const reportModal = document.getElementById("reportModal");
    reportModal.classList.remove("active");

    try {
      await addDoc(collection(db, "reports"), {
        locationId: location.id,
        locationName: location.name,
        status: status,
        timestamp: Date.now(),
        userId: user.uid,
      });
      console.log("Report submitted successfully!");
    } catch (e) {
      console.error("Full Firebase Error:", e);
      if (e.code === "permission-denied") {
        alert("Error: You do not have permission to write to the database.");
      } else {
        alert(`Error submitting report: ${e.message}`);
      }
    }
  }

  const btnAvailable = document.querySelector(".report-button.available");
  const btnFull = document.querySelector(".report-button.full");
  const closeReportBtn = document.getElementById("closeReportModal");

  if (btnAvailable) {
    btnAvailable.addEventListener("click", () =>
      handleReportSubmission("available")
    );
  }
  if (btnFull) {
    btnFull.addEventListener("click", () => handleReportSubmission("full"));
  }
  if (closeReportBtn) {
    closeReportBtn.addEventListener("click", () => {
      document.getElementById("reportModal").classList.remove("active");
    });
  }

  function checkNearbyZones(userLng, userLat) {
    if (!window.mapIsReady) return;

    parkingLocations.forEach((location) => {
      if (location.status === "closed") return;

      const distance = getDistance(
        userLng,
        userLat,
        location.center[0],
        location.center[1]
      );

      // If user is within zone radius, prompt for report (only once per 10 minutes)
      if (distance < location.radius) {
        const lastPrompt = sessionStorage.getItem(`lastPrompt-${location.id}`); // <--- ISSUE: SessionStorage
        const now = Date.now();

        if (!lastPrompt || now - parseInt(lastPrompt) > 10 * 60 * 1000) {
          localStorage.setItem(`lastPrompt-${location.id}`, now.toString()); // <--- ISSUE: localStorage used here
          showReportModal(location);
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

  // ========== Load "Last Updated" ==========
  async function loadLastUpdated() {
    const ref = doc(db, "meta", "lastUpdated");
    const snap = await getDoc(ref);
    lastUpdatedDisplay.textContent = snap.exists()
      ? "Last updated: " + snap.data().time.toDate().toLocaleString()
      : "Last updated: unknown";
  }
  loadLastUpdated();

  // ========== Initialize Map ==========
  const map = new maplibregl.Map({
    container: mapContainer,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
    center: [-123.0016, 49.2505],
    zoom: 15,
  });
  map.on("load", () => {
    window.mapIsReady = true;
  });
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  new maplibregl.Marker({ color: "#ff0000" })
    .setLngLat([-123.0016, 49.2505])
    .setPopup(new maplibregl.Popup().setHTML("<b>BCIT Burnaby Campus</b>"))
    .addTo(map);

  // ========== Locate Me ==========
  locateBtn.addEventListener("click", () => {
    locateBtn.style.opacity = "0.6";
    setTimeout(() => (locateBtn.style.opacity = "1"), 200);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          if (userMarker) userMarker.remove();
          userMarker = new maplibregl.Marker({ color: "#007bff" })
            .setLngLat(coords)
            .setPopup(new maplibregl.Popup().setHTML("<b>You are here!</b>"))
            .addTo(map);
          map.flyTo({ center: coords, zoom: 16, duration: 1500 });
        },
        () => alert("Could not get your location.")
      );
    } else alert("Geolocation not supported.");
  });

  // Watch user position continuously for automatic prompts
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

  drawParkingZones();

  // ========== Home Button ==========
  homeIcon.addEventListener("click", (e) => {
    e.preventDefault();
    map.flyTo({ center: [-123.0016, 49.2505], zoom: 15, duration: 1500 });
  });

  // ========== Search Modal ==========
  searchBtn.addEventListener("click", () => {
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
    searchTimeout = setTimeout(() => searchLocation(query), 500);
  });

  async function searchLocation(query) {
    try {
      searchResults.innerHTML =
        '<div style="text-align:center;padding:20px;color:#666;">Searching...</div>';
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          query
        )}.json?key=${MAPTILER_KEY}&proximity=-123.0016,49.2505`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0)
        displayResults(data.features);
      else
        searchResults.innerHTML =
          '<div style="text-align:center;padding:20px;color:#666;">No results found</div>';
    } catch (err) {
      console.error(err);
      searchResults.innerHTML =
        '<div style="text-align:center;padding:20px;color:#666;">Error searching</div>';
    }
  }

  function displayResults(features) {
    searchResults.innerHTML = "";
    features.forEach((feature) => {
      const item = document.createElement("div");
      item.className = "search-result-item";

      const name = document.createElement("div");
      name.className = "result-name";
      name.textContent = feature.text;

      const address = document.createElement("div");
      address.className = "result-address";
      address.textContent = feature.place_name;

      const addFavBtn = document.createElement("button");
      addFavBtn.textContent = "⭐ Add Favourite";
      addFavBtn.style.marginLeft = "10px";
      addFavBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!auth.currentUser) return alert("Please log in first!");
        const favRef = collection(
          db,
          "users",
          auth.currentUser.uid,
          "favourites"
        );
        await addDoc(favRef, {
          label: feature.text,
          address: feature.place_name,
        });
        loadFavouritesToMain();
      });

      item.appendChild(name);
      item.appendChild(address);
      item.appendChild(addFavBtn);

      item.addEventListener("click", () => goToLocation(feature));
      searchResults.appendChild(item);
    });
  }

  function goToLocation(feature) {
    const [lng, lat] = feature.center;
    if (searchMarker) searchMarker.remove();
    searchMarker = new maplibregl.Marker({ color: "#22c55e" })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup().setHTML(`<b>${feature.place_name}</b>`))
      .addTo(map);
    map.flyTo({ center: [lng, lat], zoom: 16, duration: 2000 });
    searchMarker.togglePopup();
    searchModal.style.display = "none";
    locationInput.value = "";
    searchResults.innerHTML = "";
  }

  // ========== Favourites ==========
  onAuthStateChanged(auth, () => loadFavouritesToMain());

  async function loadFavouritesToMain() {
    favouritesList.innerHTML = "";
    if (!auth.currentUser) {
      favouritesList.innerHTML = "<li>Please log in to see favourites.</li>";
      return;
    }

    const favRef = collection(db, "users", auth.currentUser.uid, "favourites");
    const snapshot = await getDocs(favRef);

    snapshot.forEach((docSnap) => {
      const fav = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `${fav.label} – ${fav.address} <button>❌</button>`;

      const btn = li.querySelector("button");
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteDoc(
          doc(db, "users", auth.currentUser.uid, "favourites", docSnap.id)
        );
        loadFavouritesToMain();
      });

      li.addEventListener("click", () => {
        favouritesModal.style.display = "none";
        goToFavouriteLocation(fav);
      });

      favouritesList.appendChild(li);
    });
  }

  async function goToFavouriteLocation(fav) {
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          fav.address
        )}.json?key=${MAPTILER_KEY}`
      );
      const data = await res.json();
      if (!data.features || data.features.length === 0) return;
      goToLocation(data.features[0]);
    } catch (err) {
      console.error("Error going to favourite location", err);
    }
  }

  // Favourites modal open/close
  openFavourites.addEventListener("click", (e) => {
    e.preventDefault();
    favouritesModal.style.display = "block";
    loadFavouritesToMain();
  });
  closeFavourites.addEventListener("click", () => {
    favouritesModal.style.display = "none";
  });

  // Close report modal functionality
  document.getElementById("closeReportModal").addEventListener("click", () => {
    document.getElementById("reportModal").style.display = "none";
  });
});
