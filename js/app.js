var initialLocations = [
          {title: 'Langham Place, Hong Kong', location: {lat: 22.317914,lng: 114.168744}, selected: 0},
          {title: 'Mong Kok Computer Centre', location: {lat: 22.318543,lng: 114.171082}, selected: 0},
          {title: 'Golden Shopping Centre', location: {lat: 22.331781,lng: 114.162291}, selected: 0},
          {title: 'New Town Plaza', location: {lat: 22.382208,lng: 114.188184}, selected: 0},
          {title: 'Tsuen Wan Plaza', location: {lat: 22.370606,lng: 114.1107}, selected: 0}
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
       self.places.push(place);
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

ko.applyBindings(new ViewModel());

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


  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;

    //wikipedia api
    var remoteUrlWithOrigin = 'https://en.wikipedia.org/w/api.php?format=json&action=opensearch&search=' + marker.title + '&callback=?';

    //show error message after loading for 8s
    var wikiRequestTimout = setTimeout(function() {
      infowindow.setContent('<div>' + marker.title + '</div><div>Failed to search in Wikipedia.</div>');
    }, 8000);

    $.ajax( {
        url: remoteUrlWithOrigin,
        dataType: 'jsonp',
        type: 'GET',
        success: function(data) {
        // do something with data
            // console.log(data);
        infowindow.setContent('<div>' + marker.title + '</div><a href="' +data[3][0] + '">' + data[1][0] +'</a><p>'+data[2][0]+'</p>');

            //clear the timeout message if the AJAX runs successfully
            clearTimeout(wikiRequestTimout);
        }
    } );

      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  }
  // This function will loop through the markers array and display them all.
  function showListings() {
    marker.setMap(null);
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);

    for(var i=0; i<initialLocations.length; i++) {
      document.getElementById('place'+i).addEventListener('click', selectingPlace);
    }
  };

  // This function will loop through the listings and hide them all.
  function hideListings() {
    marker.setMap(null);
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  };

  function selectingPlace() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }

    marker.setMap(null);

    marker = new google.maps.Marker({
         animation: google.maps.Animation.BOUNCE,
         position: selectedMarker.location,
         // on the map, and give it your own title!
         title: selectedMarker.title,
         icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
       });

       marker.setMap(map);

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
  };
};
