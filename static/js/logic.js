// Store API endpoint
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// Retrieve data from the url
d3.json(url).then(function (data) {

    // Console log data
    console.log(data);

    // Send data.features to createFeatures for markers
    createFeatures(data.features);
});

// Create function for marker size
function markerSize(magnitude) {
    return magnitude * 10000;
};

// Create function for marker color
function markerColor(depth) {
    if (depth < 10) return "#60ff2f";
    else if (depth < 30) return "#b6ff2f";
    else if (depth < 50) return "#ffc40d";
    else if (depth < 70) return "#e3a21a";
    else if (depth < 90) return "#da532c";
    else return "#ee1111";
}

// Create function for earthquake map
function createFeatures(earthquakeData) {

    // Create function for markers to show magnitude and location
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData obj.
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlon) {

        // Determine style of markers based on magnitude
            var markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.5,
                color: "black",
                stroke: true,
                weight: 0.5
            }
            return L.circle(latlon, markers);
        }
    });

    // Send earthquakes layer to create map
    createMap(earthquakes);
}

// Create function for base and overlay maps
function createMap(earthquakes) {

    // Create tile layer using MapBox and OpenStreet
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        style:'mapbox/light-v11',

        // Use publicly available API access token
        access_token: 'pk.eyJ1IjoibWljaGVsbGVjYXJ2YWxobyIsImEiOiJjbGUwbXBxYzMxY3RzM3ZueTN6ZnRicGJxIn0.rtETj8AmHXnbIsQ-RguXFA'
      });

      // Create map with layers to display
      var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [grayscale, earthquakes]
      });

      // Create legend for map info in the bottom right position
      var legend = L.control({position: "bottomright"});
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

        // Loop through value ranges to for each
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
            '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap)
};