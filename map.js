import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// -------------------------------------
// Show and load map 
// -------------------------------------
function showMap() {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // put token in .env
    // BCIT location 49.25324576104826, -123.00163752324765  Centered at BCIT
    const map = new mapboxgl.Map({
        container: "map",                        // <div id="map"></div>
        style: "mapbox://styles/mapbox/standard",// any Mapbox style
        center: [-123.00163752324765, 49.25324576104826],
        zoom: 10
    });
    // Add user controls to map, zoom bar
    map.addControl(new mapboxgl.NavigationControl());

    // Run setupMap() once when the style loads
    map.once("load", () => setupMap(map)); // run once for the initial style

    //One-time setup function to add layers, sources, etc.
    //You can call additional functions from here to keep things organized.
    function setupMap(map) {
        addUserPin(map);
        //add other layers and stuff here
        //addCustomLayer1(map);
        //addCustomLayer2(map);
        //addCustomLayer3(map);
    }
}
showMap();

//-----------------------------------------------------
// Add pin for showing where the user is.
// This is a separate function so that we can use a different
// looking pin for the user.  
// This version uses a pin that is just a circle. 
//------------------------------------------------------
function addUserPin(map) {

    // Adds user's current location as a source to the map
    navigator.geolocation.getCurrentPosition(position => {
        const userLocation = [position.coords.longitude, position.coords.latitude];
        console.log(userLocation);
        if (userLocation) {
            map.addSource('userLocation', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': userLocation
                        },
                        'properties': {
                            'description': 'Your location'
                        }
                    }]
                }
            });

            // Creates a layer above the map displaying the pins
            // Add a layer showing the places.
            map.addLayer({
                'id': 'userLocation',
                'type': 'circle', // what the pins/markers/points look like
                'source': 'userLocation',
                'paint': { // customize colour and size
                    'circle-color': 'blue',
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });
        }
    });
}