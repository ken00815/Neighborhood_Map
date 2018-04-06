var menuOptions = ['All','Hong Kong Island','Kowloon','New Territories'];

var allLocations = [
    {
        title: 'Langham Place, Hong Kong',
        location: {
            lat: 22.317914,
            lng: 114.168744
        },
        selected: 0,
        districtId: 2
    },
    {
        title: 'Mong Kok Computer Centre',
        location: {
            lat: 22.318543,
            lng: 114.171082
        },
        selected: 0,
        districtId: 2
    },    
    {
        title: 'Golden Shopping Centre',
        location: {
            lat: 22.331781,
            lng: 114.162291
        },
        selected: 0,
        districtId: 2
    },
    {
        title: 'New Town Plaza',
        location: {
            lat: 22.382208,
            lng: 114.188184
        },
        selected: 0,
        districtId: 3
    },
    {
        title: 'Tsuen Wan Plaza',
        location: {
            lat: 22.370606,
            lng: 114.1107
        },
        selected: 0,
        districtId: 3
    }
  ],
  hkIsland = [],
  kln = [
    {
      title: 'Langham Place, Hong Kong',
      location: {
          lat: 22.317914,
          lng: 114.168744
      },
      selected: 0
    },
    {
      title: 'Mong Kok Computer Centre',
      location: {
          lat: 22.318543,
          lng: 114.171082
      },
      selected: 0
    },
    {
      title: 'Golden Shopping Centre',
      location: {
          lat: 22.331781,
          lng: 114.162291
      },
      selected: 0
    }
  ],
  nt = [
    {
      title: 'New Town Plaza',
      location: {
          lat: 22.382208,
          lng: 114.188184
      },
      selected: 0
    },
    {
        title: 'Tsuen Wan Plaza',
        location: {
            lat: 22.370606,
            lng: 114.1107
        },
        selected: 0
    }
  ];


var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.selected = ko.observable(data.selected);
};

var District = function (data) {
  this.name = ko.observable(data.name);
}

var ViewModel = function() {
    var self = this;

    //indicator of the status of the list, 0:hide, 1:show
    var listStatus = ko.observable(0);

    //initiate the location list
    // this.locationList = ko.observableArray([]);
    //
    // allLocations.forEach(function(placeItem) {
    //     self.locationList.push(new Location(placeItem));
    // });


    this.districtList = ko.observableArray([]);
    for (var i=0; i<menuOptions.length; i++){
      self.districtList().push(menuOptions[i]);
    }

    this.currentOptions = ko.observableArray();

    this.newList = ko.observableArray();

    this.refreshList = ko.computed(function() {
      var change = self.currentOptions();

      switch(change){
        case "All":
          self.newList.removeAll();
          allLocations.forEach(function(placeItem) {
              self.newList.push(new Location(placeItem));
          });
          break;
        case "Kowloon":
          self.newList.removeAll();
          kln.forEach(function(placeItem) {
              self.newList.push(new Location(placeItem));
          });
          break;
        case "Hong Kong Island":
          self.newList.removeAll();
          hkIsland.forEach(function(placeItem) {
              self.newList.push(new Location(placeItem));
          });
          break;
        case "New Territories":
          self.newList.removeAll();
          nt.forEach(function(placeItem) {
              self.newList.push(new Location(placeItem));
          });
          break;
      }


    });


    this.openList = function(){
        listStatus(1);
    };

    this.closeList = function() {
      listStatus(0);
    };

    this.changeListStatus = function() {
      return listStatus();
    };


    this.selectedKO = ko.observable();
    //return the selected location
    this.selectMarker = function(chosenMarker) {
        //remove the flag that selected place
        for (var i = 0; i < allLocations.length; i++) {
            allLocations[i].selected = 0;
            document.getElementById('place' + i).removeAttribute("class");
        }

        //set a flag representing "selected"
        for (i = 0; i < allLocations.length; i++) {
            if (chosenMarker.title() === allLocations[i].title) {
                allLocations[i].selected = 1;
                //Text turn red while clicked
                document.getElementById('place' + i).setAttribute("class", "selected");
            }
        }
    };
};

ko.applyBindings(new ViewModel());

//Google Map API Handling
var map;

function initMap() {
    var largeInfowindow = new google.maps.InfoWindow();
    //the backgroud map from google
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 22.396428,
            lng: 114.109497
        },
        zoom: 11
    });

    //getting the list of google map
    var markers = [];
    for (var i = 0; i < allLocations.length; i++) {
        // Get the position from the location array.
        var position = allLocations[i].location;
        var title = allLocations[i].title;
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

            for (var j=0; j<markers.length; j++){
              markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
              markers[j].setAnimation(null);
            }

            this.setAnimation(google.maps.Animation.BOUNCE);
            this.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
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

            $.ajax({
                url: remoteUrlWithOrigin,
                dataType: 'jsonp',
                type: 'GET',
                success: function(data) {
                    // do something with data
                    // console.log(data);
                    infowindow.setContent('<div>' + marker.title + '</div><a target="_blank" href="' + data[3][0] + '">' + data[1][0] + '</a><p>' + data[2][0] + '</p>');

                    //clear the timeout message if the AJAX runs successfully
                    clearTimeout(wikiRequestTimout);
                }
            });

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

    }

    document.getElementById("districtMenu").addEventListener('change',changeDistrict);

    function changeDistrict() {

      marker.setMap(null);
      var changes = document.getElementById("districtMenu").value;
      switch(changes){
        case "All":

          break;
        case "Hong Kong Island":

          break;
        case "Hong Kong Island":

          break;
        case "Hong Kong Island":

          break;

      }

      var bounds = new google.maps.LatLngBounds();
      // Extend the boundaries of the map for each marker and display the marker
      for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
      }
      map.fitBounds(bounds);

    }

    //Event Listener for click the list
    for (i = 0; i < allLocations.length; i++) {
        document.getElementById('place' + i).addEventListener('click', function(numCopy) {
          return function() {
            // alert(numCopy);
            populateInfoWindow(markers[numCopy], largeInfowindow);

            for (var j=0; j<markers.length; j++){
              markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
              markers[j].setAnimation(null);
            }

            markers[numCopy].setAnimation(google.maps.Animation.BOUNCE);
            markers[numCopy].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
          };
        }(i));
    }

    // This function will loop through the listings and hide them all.
    function hideListings() {
        marker.setMap(null);
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

}

function googleError(){
    alert('SorryGoogle Maps cannot be loaded, please refresh the page and try again.');
};

// function selectDistrict() {
//   var e = document.getElementById("district");
//   alert(e.options[e.selectedIndex].value)
// }
