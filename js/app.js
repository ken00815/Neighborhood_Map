var menuOptions = ['All','Hong Kong Island','Kowloon','New Territories'];

var allLocations = [
    {
        title: 'Langham Place, Hong Kong',
        location: {
            lat: 22.317914,
            lng: 114.168744
        },
        selected: 0,
        placeId: 0
    },
    {
        title: 'Mong Kok Computer Centre',
        location: {
            lat: 22.318543,
            lng: 114.171082
        },
        selected: 0,
        placeId: 1
    },
    {
        title: 'Golden Shopping Centre',
        location: {
            lat: 22.331781,
            lng: 114.162291
        },
        selected: 0,
        placeId: 2
    },
    {
        title: 'New Town Plaza',
        location: {
            lat: 22.382208,
            lng: 114.188184
        },
        selected: 0,
        placeId: 3
    },
    {
        title: 'Tsuen Wan Plaza',
        location: {
            lat: 22.370606,
            lng: 114.1107
        },
        selected: 0,
        placeId: 4
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
      selected: 0,
      placeId: 0
    },
    {
      title: 'Mong Kok Computer Centre',
      location: {
          lat: 22.318543,
          lng: 114.171082
      },
      selected: 0,
      placeId: 1
    },
    {
      title: 'Golden Shopping Centre',
      location: {
          lat: 22.331781,
          lng: 114.162291
      },
      selected: 0,
      placeId: 2
    }
  ],
  nt = [
    {
      title: 'New Town Plaza',
      location: {
          lat: 22.382208,
          lng: 114.188184
      },
      selected: 0,
      placeId: 3
    },
    {
        title: 'Tsuen Wan Plaza',
        location: {
            lat: 22.370606,
            lng: 114.1107
        },
        selected: 0,
        placeId: 4
    }
  ];


var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.selected = ko.observable(data.selected);
    this.placeId = ko.observable(data.placeId);
};

var District = function (data) {
  this.name = ko.observable(data.name);
};

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
        for (var i = 0; i < self.newList().length; i++) {
          if(document.getElementById(self.newList()[i].placeId()).classList.contains('selected')){
            allLocations[i].selected = 0;
            document.getElementById(self.newList()[i].placeId()).removeAttribute("class");
          }
        }

        //set a flag representing "selected"
        for (i = 0; i < self.newList().length; i++) {
            if (chosenMarker.title() === self.newList()[i].title) {
                allLocations[i].selected = 1;
                //Text turn red while clicked
                document.getElementById(self.newList()[i].placeId()).setAttribute("class", "selected");
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
    document.getElementById('hide-listings').addEventListener('click', function() {
      hideListings(markers);
    });


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
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                marker.setAnimation(null);
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

    document.getElementById("districtMenu").addEventListener('change',changeDistrict);

      // var bounds = new google.maps.LatLngBounds();
      // Extend the boundaries of the map for each marker and display the marker
      for (i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
      }
      map.fitBounds(bounds);
    }


    //Event Listener for click the list
    for (i = 0; i < allLocations.length; i++) {
      var a = allLocations[i].placeId;
        document.getElementById(a).addEventListener('click', function(numCopy) {
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

    document.getElementById("districtMenu").addEventListener('change',refreshEventListener);

    function refreshEventListener() {
      var changes = document.getElementById("districtMenu").value;
      switch(changes) {
        case "All":
          for (i = 0; i < allLocations.length; i++) {
            var a = allLocations[i].placeId;
              document.getElementById(a).addEventListener('click', function(numCopy) {
                return function() {
                  // alert(numCopy);
                  populateInfoWindow(markers[a], largeInfowindow);

                  for (var j=0; j<markers.length; j++){
                    markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                    markers[j].setAnimation(null);
                  }

                  markers[numCopy].setAnimation(google.maps.Animation.BOUNCE);
                  markers[numCopy].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                };
              }(i));
          }
          break;
        case "Hong Kong Island":
          for (i = 0; i < hkIsland.length; i++) {
            a = hkIsland[i].placeId;
              document.getElementById(a).addEventListener('click', function(numCopy) {
                return function() {
                  // alert(numCopy);
                  populateInfoWindow(markers[hkIsland[numCopy].placeId], largeInfowindow);

                  for (var j=0; j<markers.length; j++){
                    markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                    markers[j].setAnimation(null);
                  }

                  markers[hkIsland[numCopy].placeId].setAnimation(google.maps.Animation.BOUNCE);
                  markers[hkIsland[numCopy].placeId].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                };
              }(i));
          }
          break;
        case "Kowloon":
          for (i = 0; i < kln.length; i++) {
            a = kln[i].placeId;
              document.getElementById(a).addEventListener('click', function(numCopy) {
                return function() {
                  // alert(numCopy);
                  populateInfoWindow(markers[kln[numCopy].placeId], largeInfowindow);

                  for (var j=0; j<markers.length; j++){
                    markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                    markers[j].setAnimation(null);
                  }

                  markers[kln[numCopy].placeId].setAnimation(google.maps.Animation.BOUNCE);
                  markers[kln[numCopy].placeId].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                };
              }(i));
          };
          break;
        case "New Territories":
          for (i = 0; i < nt.length; i++) {
            a = nt[i].placeId;
              document.getElementById(a).addEventListener('click', function(numCopy) {
                return function() {
                  // alert(numCopy);
                  populateInfoWindow(markers[nt[numCopy].placeId], largeInfowindow);

                  for (var j=0; j<markers.length; j++){
                    markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                    markers[j].setAnimation(null);
                  }
                    console.log(numCopy);
                  markers[nt[numCopy].placeId].setAnimation(google.maps.Animation.BOUNCE);
                  markers[nt[numCopy].placeId].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                };
              }(i));
          }
          break;
      }

    }


    // This function will loop through the listings and hide them all.
    function hideListings(markers) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }

    }

    var disdrictBounds = new google.maps.LatLngBounds();
    var disBounding_NT =
      {
        swbound: {
        lat: 22.36018,
        lng: 113.947133
      },
        nebound: {
          lat: 22.552163,
          lng: 114.429739
        }
      };
    var disBounding_All =
    {
      swbound: {
      lat: 22.204289,
      lng: 113.858281
      },
      nebound: {
        lat: 22.544183,
        lng: 114.292478
      }
    };
    var disBounding_KLN =
    {
      swbound: {
      lat: 22.301491,
      lng: 114.157082
    },
      nebound: {
        lat: 22.355372,
        lng: 114.240944
      }
    };
    var disBounding_HKI =
    {
      swbound: {
      lat: 22.253085,
      lng: 114.132798
    },
      nebound: {
        lat: 22.298755,
        lng: 114.254045
      }
    };

    function changeDistrict() {
      var changes = document.getElementById("districtMenu").value;
      if(changes === "New Territories") {
        disdrictBounds = new google.maps.LatLngBounds(disBounding_NT.swbound,disBounding_NT.nebound);
      }else if(changes === "All") {
        disdrictBounds = new google.maps.LatLngBounds(disBounding_All.swbound,disBounding_All.nebound);
      }else if(changes === "Hong Kong Island"){
        disdrictBounds = new google.maps.LatLngBounds(disBounding_HKI.swbound,disBounding_HKI.nebound);
      }else if(changes === "Kowloon"){
        disdrictBounds = new google.maps.LatLngBounds(disBounding_KLN.swbound,disBounding_KLN.nebound);
      }

      hideListings(markers);
      for (var j=0; j<markers.length; j++){
        markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        markers[j].setAnimation(null);
      }
      var menuOptions = ['All', 'Hong Kong Island', 'Kowloon', 'New Territories'];

      var allLocations = [{
                  title: 'Langham Place, Hong Kong',
                  location: {
                      lat: 22.317914,
                      lng: 114.168744
                  },
                  selected: 0,
                  placeId: 0
              },
              {
                  title: 'Mong Kok Computer Centre',
                  location: {
                      lat: 22.318543,
                      lng: 114.171082
                  },
                  selected: 0,
                  placeId: 1
              },
              {
                  title: 'Golden Shopping Centre',
                  location: {
                      lat: 22.331781,
                      lng: 114.162291
                  },
                  selected: 0,
                  placeId: 2
              },
              {
                  title: 'New Town Plaza',
                  location: {
                      lat: 22.382208,
                      lng: 114.188184
                  },
                  selected: 0,
                  placeId: 3
              },
              {
                  title: 'Tsuen Wan Plaza',
                  location: {
                      lat: 22.370606,
                      lng: 114.1107
                  },
                  selected: 0,
                  placeId: 4
              }
          ],
          hkIsland = [],
          kln = [{
                  title: 'Langham Place, Hong Kong',
                  location: {
                      lat: 22.317914,
                      lng: 114.168744
                  },
                  selected: 0,
                  placeId: 0
              },
              {
                  title: 'Mong Kok Computer Centre',
                  location: {
                      lat: 22.318543,
                      lng: 114.171082
                  },
                  selected: 0,
                  placeId: 1
              },
              {
                  title: 'Golden Shopping Centre',
                  location: {
                      lat: 22.331781,
                      lng: 114.162291
                  },
                  selected: 0,
                  placeId: 2
              }
          ],
          nt = [{
                  title: 'New Town Plaza',
                  location: {
                      lat: 22.382208,
                      lng: 114.188184
                  },
                  selected: 0,
                  placeId: 3
              },
              {
                  title: 'Tsuen Wan Plaza',
                  location: {
                      lat: 22.370606,
                      lng: 114.1107
                  },
                  selected: 0,
                  placeId: 4
              }
          ];


      var Location = function(data) {
          this.title = ko.observable(data.title);
          this.location = ko.observable(data.location);
          this.selected = ko.observable(data.selected);
          this.placeId = ko.observable(data.placeId);
      };

      var District = function(data) {
          this.name = ko.observable(data.name);
      };

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
          for (var i = 0; i < menuOptions.length; i++) {
              self.districtList().push(menuOptions[i]);
          }

          this.currentOptions = ko.observableArray();

          this.newList = ko.observableArray();

          this.refreshList = ko.computed(function() {
              var change = self.currentOptions();

              switch (change) {
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


          this.openList = function() {
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
              for (var i = 0; i < self.newList().length; i++) {
                  if (document.getElementById(self.newList()[i].placeId()).classList.contains('selected')) {
                      allLocations[i].selected = 0;
                      document.getElementById(self.newList()[i].placeId()).removeAttribute("class");
                  }
              }

              //set a flag representing "selected"
              for (i = 0; i < self.newList().length; i++) {
                  if (chosenMarker.title() === self.newList()[i].title) {
                      allLocations[i].selected = 1;
                      //Text turn red while clicked
                      document.getElementById(self.newList()[i].placeId()).setAttribute("class", "selected");
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

                  for (var j = 0; j < markers.length; j++) {
                      markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                      markers[j].setAnimation(null);
                  }

                  this.setAnimation(google.maps.Animation.BOUNCE);
                  this.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
              });

          }

          document.getElementById('show-listings').addEventListener('click', showListings);
          document.getElementById('hide-listings').addEventListener('click', function() {
              hideListings(markers);
          });


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
                      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                      marker.setAnimation(null);
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

              document.getElementById("districtMenu").addEventListener('change', changeDistrict);

              // var bounds = new google.maps.LatLngBounds();
              // Extend the boundaries of the map for each marker and display the marker
              for (i = 0; i < markers.length; i++) {
                  markers[i].setMap(map);
                  bounds.extend(markers[i].position);
              }
              map.fitBounds(bounds);
          }


          //Event Listener for click the list
          for (i = 0; i < allLocations.length; i++) {
              var a = allLocations[i].placeId;
              document.getElementById(a).addEventListener('click', function(numCopy) {
                  return function() {
                      // alert(numCopy);
                      populateInfoWindow(markers[numCopy], largeInfowindow);

                      for (var j = 0; j < markers.length; j++) {
                          markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                          markers[j].setAnimation(null);
                      }

                      markers[numCopy].setAnimation(google.maps.Animation.BOUNCE);
                      markers[numCopy].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                  };
              }(i));
          }

          document.getElementById("districtMenu").addEventListener('change', refreshEventListener);

          function refreshEventListener() {
              var changes = document.getElementById("districtMenu").value;
              switch (changes) {
                  case "All":
                      for (i = 0; i < allLocations.length; i++) {
                          var a = allLocations[i].placeId;
                          document.getElementById(a).addEventListener('click', function(numCopy) {
                              return function() {
                                  // alert(numCopy);
                                  populateInfoWindow(markers[a], largeInfowindow);

                                  for (var j = 0; j < markers.length; j++) {
                                      markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                                      markers[j].setAnimation(null);
                                  }

                                  markers[numCopy].setAnimation(google.maps.Animation.BOUNCE);
                                  markers[numCopy].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                              };
                          }(i));
                      }
                      break;
                  case "Hong Kong Island":
                      for (i = 0; i < hkIsland.length; i++) {
                          a = hkIsland[i].placeId;
                          document.getElementById(a).addEventListener('click', function(numCopy) {
                              return function() {
                                  // alert(numCopy);
                                  populateInfoWindow(markers[hkIsland[numCopy].placeId], largeInfowindow);

                                  for (var j = 0; j < markers.length; j++) {
                                      markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                                      markers[j].setAnimation(null);
                                  }

                                  markers[hkIsland[numCopy].placeId].setAnimation(google.maps.Animation.BOUNCE);
                                  markers[hkIsland[numCopy].placeId].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                              };
                          }(i));
                      }
                      break;
                  case "Kowloon":
                      for (i = 0; i < kln.length; i++) {
                          a = kln[i].placeId;
                          document.getElementById(a).addEventListener('click', function(numCopy) {
                              return function() {
                                  // alert(numCopy);
                                  populateInfoWindow(markers[kln[numCopy].placeId], largeInfowindow);

                                  for (var j = 0; j < markers.length; j++) {
                                      markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                                      markers[j].setAnimation(null);
                                  }

                                  markers[kln[numCopy].placeId].setAnimation(google.maps.Animation.BOUNCE);
                                  markers[kln[numCopy].placeId].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                              };
                          }(i));
                      };
                      break;
                  case "New Territories":
                      for (i = 0; i < nt.length; i++) {
                          a = nt[i].placeId;
                          document.getElementById(a).addEventListener('click', function(numCopy) {
                              return function() {
                                  // alert(numCopy);
                                  populateInfoWindow(markers[nt[numCopy].placeId], largeInfowindow);

                                  for (var j = 0; j < markers.length; j++) {
                                      markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                                      markers[j].setAnimation(null);
                                  }
                                  console.log(numCopy);
                                  markers[nt[numCopy].placeId].setAnimation(google.maps.Animation.BOUNCE);
                                  markers[nt[numCopy].placeId].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                              };
                          }(i));
                      }
                      break;
              }

          }


          // This function will loop through the listings and hide them all.
          function hideListings(markers) {
              for (var i = 0; i < markers.length; i++) {
                  markers[i].setMap(null);
              }

          }

          var disdrictBounds = new google.maps.LatLngBounds();
          var disBounding_NT = {
              swbound: {
                  lat: 22.36018,
                  lng: 113.947133
              },
              nebound: {
                  lat: 22.552163,
                  lng: 114.429739
              }
          };
          var disBounding_All = {
              swbound: {
                  lat: 22.204289,
                  lng: 113.858281
              },
              nebound: {
                  lat: 22.544183,
                  lng: 114.292478
              }
          };
          var disBounding_KLN = {
              swbound: {
                  lat: 22.301491,
                  lng: 114.157082
              },
              nebound: {
                  lat: 22.355372,
                  lng: 114.240944
              }
          };
          var disBounding_HKI = {
              swbound: {
                  lat: 22.253085,
                  lng: 114.132798
              },
              nebound: {
                  lat: 22.298755,
                  lng: 114.254045
              }
          };

          function changeDistrict() {
              var changes = document.getElementById("districtMenu").value;
              if (changes === "New Territories") {
                  disdrictBounds = new google.maps.LatLngBounds(disBounding_NT.swbound, disBounding_NT.nebound);
              } else if (changes === "All") {
                  disdrictBounds = new google.maps.LatLngBounds(disBounding_All.swbound, disBounding_All.nebound);
              } else if (changes === "Hong Kong Island") {
                  disdrictBounds = new google.maps.LatLngBounds(disBounding_HKI.swbound, disBounding_HKI.nebound);
              } else if (changes === "Kowloon") {
                  disdrictBounds = new google.maps.LatLngBounds(disBounding_KLN.swbound, disBounding_KLN.nebound);
              }

              hideListings(markers);
              for (var j = 0; j < markers.length; j++) {
                  markers[j].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                  markers[j].setAnimation(null);
              }

              for (i = 0; i < markers.length; i++) {
                  if (disdrictBounds.contains(markers[i].position)) {
                      markers[i].setAnimation(google.maps.Animation.DROP);
                      markers[i].setMap(map);
                  }
              }
          }



      }


      function googleError() {
          alert('SorryGoogle Maps cannot be loaded, please refresh the page and try again.');
      }
      for(i=0; i<markers.length; i++) {
        if(disdrictBounds.contains(markers[i].position)) {
          markers[i].setAnimation(google.maps.Animation.DROP);
          markers[i].setMap(map);
        }
      }
    }



}


function googleError(){
    alert('SorryGoogle Maps cannot be loaded, please refresh the page and try again.');
}
