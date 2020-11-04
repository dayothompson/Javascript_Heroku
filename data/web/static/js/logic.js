var url = "http://127.0.0.1:5000//jsonified";

// ######## Heat Map ########
function heatmap() {
  var myMapHeat = L.map("map", {
    center: [51.025036,-114.0411447],
    zoom: 10.5
  });
  
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMapHeat);
  

  
  var latExists = 0.0;
  var lngExists = 0.0;

  d3.json(url, function(data) {
    response = data[0][0]
    console.log(response);
  
    var heatArray = [];
  
    for (var i = 0; i < response.length; i++) {
      var lat = response[i].lat;
      var lng = response[i].long;
    if (lat && lng) {
      latExists = lat;
      lngExists = lng;
    }    
    var location = [latExists, lngExists];
  
      if (location) {
        heatArray.push(location);
      }
    }
  
    var heat = L.heatLayer(heatArray, {
      radius: 50,
      blur: 35
    }).addTo(myMapHeat);
  
  });
}


// ######## Cluster Map ########
function clustermap() {
var latExists = 0.0;
var lngExists = 0.0;
// Grab the data with d3
d3.json(url, function(data) {

  // Create a new marker cluster group
  var markers = L.markerClusterGroup();

  // Loop through data
  response = data[0][0]
  //console.log(response);
  
    for (var i = 0; i < response.length; i++) {
      var lat = response[i].lat;
      var lng = response[i].long;
  //for (var i = 0; i < response.length; i++) {

    // Set the data location property to a variable
  //  var location = response[i].location;
  if (lat && lng) {
    latExists = lat;
    lngExists = lng;
  }    
  var location = [latExists, lngExists];

    // Check for location property
      // Add a new marker to the cluster group and bind a pop-up
      markers.addLayer(L.marker(location)
        .bindPopup(response[i].address));
  }

  // Add our marker cluster layer to the map
  myMap.addLayer(markers);

});

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "streets-v11",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-streets-v11",
  accessToken: API_KEY
});

var baseMaps = {
  "Satellite Map": satellitemap,
  "Light Map": lightmap,
  "Dark Map": darkmap,
  "Street Map": streetmap
};

// Define a map object
var myMap = L.map("mapid", {
  center: [51.025036,-114.0411447],
  zoom: 10.5,
  layers: [satellitemap]
});

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps).addTo(myMap);
}

// ######## Calling both the functions ########
heatmap();
clustermap();