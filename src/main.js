// Javascript for main.html
// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing map...");

  const map = new maplibregl.Map({
    container: "map",
    style:
      "https://api.maptiler.com/maps/streets-v2/style.json?key=G8Dm1IT5QuwmIf5bQtVr",
    center: [-123.0016, 49.2505], // BCIT Burnaby Campus
    zoom: 15,
  });

  // Track markers
  let userMarker = null;
  let searchMarker = null;

  // Add zoom & rotation controls
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  // Add BCIT marker
  new maplibregl.Marker({ color: "#ff0000" })
    .setLngLat([-123.0016, 49.2505])
    .setPopup(
      new maplibregl.Popup().setHTML("<b>BCIT Burnaby Campus</b>")
    )
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

          if (userMarker) userMarker.remove();

          userMarker = new maplibregl.Marker({ color: "#007bff" })
            .setLngLat(userLngLat)
            .setPopup(
              new maplibregl.Popup().setHTML("<b>You are here!</b>")
            )
            .addTo(map);

          map.flyTo({
            center: userLngLat,
            zoom: 16,
            duration: 1500,
          });
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
  // Home Button functionality
  const homeIcon = document.querySelector(".home-icon");
  console.log("Home icon:", homeIcon);

  homeIcon.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default link behavior
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
        )}.json?key=G8Dm1IT5QuwmIf5bQtVr&proximity=-123.0016,49.2505`
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
      .setPopup(
        new maplibregl.Popup().setHTML(`<b>${feature.place_name}</b>`)
      )
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
});