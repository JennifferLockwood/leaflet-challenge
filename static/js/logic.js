// Store API endpoint inside queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// Perform a GET request to the queryUrl.
d3.json(queryUrl, function(data) {
    // Once we get a data, send the data.features object to the createFeatures function.
    createFeatures(data);
});

// Define a function to determine size of marker reflecting the magnitude of the earthquake.
function markerSize(magnitude) {
    return (magnitude + 1) * 2.5 ;
}

// Define a function to determine colors reflecting the magnitude of the earthquake.
function getColor(mag) {
    if (mag > 5) {
        return "Purple";
    }
    if (mag >  4) {
        return "FireBrick";
    }
    if (mag > 3) {
        return "OrangeRed"
    }
    if (mag > 2) {
        return "Salmon";
    }
    if (mag > 1) {
        return "Yellow";
    }
    return "LightGreen";
}

function createFeatures(earthquakeData) {

    // Define function to determine style of marker.
    function styleInfo(feature) {
        return {
          opacity: .75,
          fillOpacity: .75,
          fillColor: getColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.75
        };
    }

    // Define a function we want to run once for each feature in the features array.
    // Give each feature a popup describing the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + Date(feature.properties.time) + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlong) {
            return L.circleMarker(latlong);
        },
        style:styleInfo
    });
  
    // Sending our earthquakes layer to the createMap function.
    createMap(earthquakes);
};

function createMap(earthquakes) {

    // Define satellite, outdoors, and grayscale layers.
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
  
    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers.
    var baseMaps = {
      "Satellite": satellite,
      "Outdoors": outdoors,
      "Grayscale" : lightmap
    };
  
    // Create overlay object to hold our overlay layer.
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the lightmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 4,
      layers: [lightmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Set up the legend.
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        var magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML = "<h4 style='margin:4px'>Magnitude</h4>";

        for (var i = 0; i < magnitude.length; i++) {
             div.innerHTML +=
             '<li style=\"background-color:' + getColor(magnitude[i] + 1) + ';\"></li> '+ 
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Adding legend to the map.
    legend.addTo(myMap);

  }