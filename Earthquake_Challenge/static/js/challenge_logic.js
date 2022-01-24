// Add console.log to check to see if our code is working.
console.log('working');

// We create the tile layer that will be the background of our map.
const streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: apiKey
});

// We create the second tile layer that will be the background of our map.
const satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: apiKey
});

// for deliverable 3
const dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: apiKey
});

// Create the map object with center, zoom level and default layer.
const map = L.map('mapid', {
  center: [40.7, -94.5],
  zoom: 3,
  layers: [streets]
});

// Create a base layer that holds all three maps.
const baseMaps = {
    Streets: streets,
    Satellite: satelliteStreets,
    Dark: dark
};

// 1. Add a 2nd layer group for the tectonic plate data.
// 1b. Add a 3rd layer group for the major earthquake data.
const allEarthquakes = new L.LayerGroup();
const tectonicPlates = new L.LayerGroup();
const majorEarthquakes = new L.LayerGroup();


// 2. Add a reference to the tectonic plates group to the overlays object.
// 2b. Add a reference to the major earthquake group to the overlays object.
const overlays = {
    Earthquakes: allEarthquakes,
    'Tectonic Plates': tectonicPlates,
    'Major Earthquakes': majorEarthquakes
};

// Then we add a control to the map that will allow the user to change which
// layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);


// There is NO reason for this function to be waiting on allEarthquakes, so I moved it out

// This function determines the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
}

// Retrieve the earthquake GeoJSON data.
const earthquakeLink = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
d3.json(earthquakeLink).then(data => {

    // This function determines the color of the marker based on the magnitude of the earthquake.
    function getColor(magnitude) {
      if (magnitude >= 5) {
          return '#ea2c2c';
      }
      if (magnitude >= 4) {
          return '#ea822c';
      }
      if (magnitude >= 3) {
          return '#ee9c00';
      }
      if (magnitude >= 2) {
          return '#eecc00';
      }
      if (magnitude >= 1) {
          return '#d4ee00';
      }
      return '#98ee00';
    }

    // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into two separate functions
    // to calculate the color and radius.
    function styleInfo(feature) {
      return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.properties.mag),
          color: '#000000',
          radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
      };
    }



    // Creating a GeoJSON layer with the retrieved data.
    L.geoJson(data, {
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,

        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(_, latlng) {
            return L.circleMarker(latlng);
        },

        // We create a popup for each circleMarker to display the magnitude and location of the earthquake
        //  after the marker has been created and styled.
        onEachFeature: function(feature, layer) {
        layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}`);
    } }).addTo(allEarthquakes);

    // Then we add the earthquake layer to our map.
    allEarthquakes.addTo(map);
});

// There is NO reason for this to be waiting  on allEarthquakes, so I moved it out of the the allEarthquakes async function
// Here we create a legend control object.
const legend = L.control({
  position: 'bottomright'
});

// Then add all the details for the legend
legend.onAdd = function() {
  const div = L.DomUtil.create('div', 'info legend');

  const magnitudes = [0, 1, 2, 3, 4, 5];
  const colors = [
    '#98ee00',
    '#d4ee00',
    '#eecc00',
    '#ee9c00',
    '#ea822c',
    '#ea2c2c'
  ];

  // Looping through our intervals to generate a label with a colored square for each interval.
  for (let i = 0; i < magnitudes.length; i++) {
    console.log(colors[i]);
    div.innerHTML += `<i style="background: ${colors[i]}"></i>  ${magnitudes[i]
      }${magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+'}`;
  }
  return div;
};

// Finally, we our legend to the map.
legend.addTo(map);

// There is NO reason for this to be waiting  on allEarthquakes, so I did not put it in the allEarthquakes async function
// 3b. Retrieve the major earthquake GeoJSON data >4.5 mag for the week.
const majorQuakesLink = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';
d3.json(majorQuakesLink).then(data => {

    //4b.
    function styleInfo(feature) {
      return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: getColor(feature.properties.mag),
          color: '#000000',
          radius: getRadius(feature.properties.mag),
          stroke: true,
          weight: 0.5
      };
    }

    // 5b. Change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake.
    function getColor(magnitude) {
      if (magnitude >= 6) {
          return '#A628FF';
      }
      if (magnitude >= 5) {
          return '#c675ff';
      }
      return '#d9a3ff';
    }

    // 6b. Use the function that determines the radius of the earthquake marker based on its magnitude.
    // It's the same code as from above.  It doesn't need to be here too.

    // 7b. Creating a GeoJSON layer with the retrieved data that adds a circle to the map 
    // sets the style of the circle, and displays the magnitude and location of the earthquake
    //  after the marker has been created and styled.
    L.geoJson(data, {
        // 4b. Use the same style as the earthquake data.
        style: styleInfo,

        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(_, latlng) {
            return L.circleMarker(latlng);
        },

        // We create a popup for each circleMarker to display the magnitude and location of the earthquake
        //  after the marker has been created and styled.
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}`);
        }
    }).addTo(majorEarthquakes);

    // 8b. Add the major earthquakes layer to the map.
    majorEarthquakes.addTo(map);
    
    // 9b. Close the braces and parentheses for the major earthquake data.
});


// There is NO reason for this to be waiting on allEarthquakes, so I moved it out of the the allEarthquakes async function
// 3. Use d3.json to make a call to get our Tectonic Plate geoJSON data.
const tectonicLink = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
// create style
const techStyle = {
  color: '#ff73d0',
  weight: 1.5
};

d3.json(tectonicLink).then(data => {
  L.geoJson(data, {
    style: techStyle,
    pointToLayer: (_, latlng) => {
      return L.marker(latlng)
    }
  }).addTo(tectonicPlates)

  tectonicPlates.addTo(map);
});