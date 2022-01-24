// create layer options
const streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: apiKey
});
  
const satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    accessToken: apiKey
});

// Create a base layer that holds both maps.
const baseMaps = {
    Streets: streets,
    Satellite: satelliteStreets
};


let earthquakes = new L.layerGroup();

// We define an object that contains the overlays.
// This overlay will be visible all the time.
let overlays = {
    Earthquakes: earthquakes
};

// add to map
const map = L.map('mapid', {
    center: [39.5, -98.5],
    zoom: 3,
    layers: [streets]
});

L.control.layers(baseMaps, overlays).addTo(map);

const earthquakeData = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// This function returns the style data for each of the earthquakes we plot on
// the map. We pass the magnitude of the earthquake into a function
// to calculate the radius.
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

// This function determines the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
function getRadius(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
    return magnitude * 4;
}

// This function determines the color of the circle based on the magnitude of the earthquake.
function getColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c";
    }
    if (magnitude > 4) {
      return "#ea822c";
    }
    if (magnitude > 3) {
      return "#ee9c00";
    }
    if (magnitude > 2) {
      return "#eecc00";
    }
    if (magnitude > 1) {
      return "#d4ee00";
    }
    return "#98ee00";
}

d3.json(earthquakeData).then(data => {
    L.geoJson(data, {
        style: styleInfo,
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng)
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${
            feature.properties.place}`);
        }
    }).addTo(earthquakes);

    earthquakes.addTo(map);
});


const legend = L.control({ position: 'bottomright' });

legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'legend');
    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
    "#98ee00",
    "#d4ee00",
    "#eecc00",
    "#ee9c00",
    "#ea822c",
    "#ea2c2c"
    ];

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < magnitudes.length; i++) {
        div.innerHTML += `<i style="background: ${colors[i]}"></i> ${
            magnitudes[i]}${magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+'}`;
    }
    return div;
};

legend.addTo(map);
