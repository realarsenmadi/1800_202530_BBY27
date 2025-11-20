// main.js
import { db, auth } from "/src/firebaseConfig.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
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
  const favForm = document.getElementById("favForm");

  let userMarker = null;
  let searchMarker = null;

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
});
