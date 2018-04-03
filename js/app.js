var initialLocations = [
          {title: 'Lucky Plaza', location: {lat: 22.382905,lng: 114.190425}, selected: 0},
          {title: 'Sino Centre', location: {lat: 22.316058,lng: 114.170363}, selected: 0},
          {title: 'Ho King Commercial Centre', location: {lat: 22.315983,lng: 114.171942}, selected: 0},
          {title: 'Golden Computer Arcade', location: {lat: 22.331781,lng: 114.162291}, selected: 0},
          {title: 'Wan Chai Computer Centre', location: {lat: 22.277223,lng: 114.173122}, selected: 0},
          {title: 'Tsuen Fung Centre Shopping Arcade', location: {lat: 22.372112,lng: 114.119317}, selected: 0}
        ];

var Location = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.selected = ko.observable(data.selected);
};

var selectedMarker = {};

var ViewModel = function() {
  var self = this;
  //indicator of the status of the list, 0:hide, 1:show
  var showList = 0;

  this.locationList = ko.observableArray([]);

  //To SHOW the list of the locations
  this.showLocations = function() {
    if(showList === 0){
      initialLocations.forEach(function(placeItem){
        self.locationList.push(new Location(placeItem));
      });
      showList = 1;
    }
  };

  //To HIDE the list of the locations
  this.hideLocations = function() {
    if(showList === 1){
      self.locationList.removeAll();
      showList = 0;
    }
  }

  self.places = ko.observableArray();

   // The current item will be passed as the first parameter, so we know which place to remove
   self.removePlace = function(place) {
       self.places.push(place)
   }

  this.selectedKO = ko.observable();
  //return the selected location
  this.selectMarker = function(chosenMarker) {
    //remove the flag that selected place
    for (var i=0; i<initialLocations.length; i++){
        initialLocations[i].selected = 0;
        document.getElementById('place'+i).removeAttribute("class");
    }

    //set a flag representing "selected"
    for (var i=0; i<initialLocations.length; i++){
      if(chosenMarker.title() === initialLocations[i].title){
        initialLocations[i].selected = 1;
        //Text turn red while clicked
        document.getElementById('place'+i).setAttribute("class","selected");
      }
    }

    self.selectedKO(chosenMarker);
    selectedMarker.title = self.selectedKO().title();
    selectedMarker.location = self.selectedKO().location();

  }
};

//Google Map API Handling
var map;
function initMap() {
  var largeInfowindow = new google.maps.InfoWindow();
//the backgroud map from google
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 22.396428, lng: 114.109497},
    zoom: 11
  });

//getting the list of google map
  var markers = [];
  for (var i = 0; i < initialLocations.length; i++) {
    // Get the position from the location array.
    var position = initialLocations[i].location;
    var title = initialLocations[i].title;
    // Create a marker per location, and put into markers array.
     var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

  }

  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', hideListings);

  for(var i=0; i<initialLocations.length; i++) {
    document.getElementById('place'+i).addEventListener('click', selectingPlace);
  }

  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  }
  // This function will loop through the markers array and display them all.
  function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  };

  // This function will loop through the listings and hide them all.
  function hideListings() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  };

  function selectingPlace() {
    
  }

};

ko.applyBindings(new ViewModel());
