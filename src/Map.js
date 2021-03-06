import React, { useState, useEffect, useRef } from "react";
import AddRestaurantForm from "./AddRestaurantForm";
import "react-rater/lib/react-rater.css";

function Map(props) {
  const [filteredState, setFilteredState] = useState(props.filteredState);
  const [newRestaurant, setNewRestaurant] = useState(null); //add new restaurant
  const [markers] = useState([]);
  let infoWindow;
  const map = useRef();
  let success = useRef(null);

  useEffect(() => {
    map.current = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 51.60678645581746, lng: -0.006617395123285 },
      zoom: 15
    });
    var options = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
  }, []);

  const bindInfoWindow = (marker, map, infowindow, html) => {
    marker.addListener("click", function() {
      if (infoWindow) {
        infoWindow.close();
      }
      infoWindow = infowindow;
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });
  };

  // adding new marker
  const createMarker = (myLatLng, map, image, content) => {
    var marker = new window.google.maps.Marker({
      position: myLatLng,
      map: map,
      icon: {
        url: image,
        scaledSize: new window.google.maps.Size(50, 50)
      }
    });
    marker.addListener("click", function() {
      if (infoWindow) {
        infoWindow.close();
      }
      var mapInfoWindow = new window.google.maps.InfoWindow({
        content: ""
      });
      infoWindow = mapInfoWindow;
      mapInfoWindow.setContent("My location");
      mapInfoWindow.open(map, marker);
    });

    var infowindow = new window.google.maps.InfoWindow({
      content: content
    });
    bindInfoWindow(marker, map, infowindow, content);

    if (content !== "Current Location") {
      markers.push(marker);
    }
  };

  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }
  function clearMarkers() {
    setMapOnAll(null);
  }
  function deleteMarkers() {
    clearMarkers();
  }

  // *** updating markers

  const updateMarkers = filtered => {
    deleteMarkers();
    filtered.map(place => {
      let content =
        "<h3>" + place.name + "</h3><h4>" + place.vicinity + "</h4>Rating: ";
      if (place.rating > 0) {
        content += place.rating;
      } else {
        content += "No ratings found!";
      }
      createMarker(
        place.geometry.location,
        map.current,
        "https://cdn4.iconfinder.com/data/icons/map-pins-2/256/21-512.png",
        content
      );
      return null;
    });
  };

  updateMarkers(props.filteredState);

  const addNewRestaurant = rJSON => {
    let content =
      "<h3>" + rJSON.name + "</h3><h4>" + rJSON.vicinity + "</h4>Rating: ";
    if (rJSON.rating > 0) {
      content += rJSON.rating;
    } else {
      content += "No ratings found!";
    }
    var marker = new window.google.maps.Marker({
      position: rJSON.geometry.location,
      map: map.current,
      title: rJSON.name,
      icon: {
        url: "https://cdn4.iconfinder.com/data/icons/map-pins-2/256/21-512.png",
        scaledSize: new window.google.maps.Size(50, 50)
      }
    });
    var infowindow = new window.google.maps.InfoWindow({
      content: content
    });
    bindInfoWindow(marker, map, infowindow, content);
    marker.setMap(map.current);
    markers.push(marker);
    let newAllRestaurants = [rJSON, ...filteredState];
    setFilteredState(newAllRestaurants);
    props.updateMain(newAllRestaurants, map.current);
    setNewRestaurant(null);
  };

  const closeAddRestaurantWindow = text => {
    setNewRestaurant(null);
  };

  // error fetching location
  const error = err => {
    const message = document.querySelector(".loader div h3");
    const loaderAnimation = document.querySelector(".lds-dual-ring");
    message.innerHTML =
      "<span style='color:#00a3d7'>Oops!</span>" +
      "<br />" +
      "<br />" +
      "Couldn't get your location, please allow location access or refresh the page!";
    message.style.color = "orange";
    loaderAnimation.style.display = "none";
  };

  // Successful location fetch
  success = position => {
    const mapCenter = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    map.current.setCenter(mapCenter);
    if (mapCenter) {
      document.querySelector(".loader").style.display = "none";
    }
    createMarker(
      mapCenter,
      map.current,
      "https://sheengroup.com.au/assets/Uploads/misc/current-location.png",
      "Current Location"
    );
    var service = new window.google.maps.places.PlacesService(map.current);
    service.nearbySearch(
      {
        location: map.current.getCenter(),
        radius: "1000",
        type: ["restaurant"]
      },
      function callback(results, status) {
        props.updateMain(results, map.current);
        setFilteredState(results);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            var place = results[i];
            let content =
              "<h3>" +
              place.name +
              "</h3><h4>" +
              place.vicinity +
              "</h4>Rating: ";
            if (place.rating > 0) {
              content += place.rating;
            } else {
              content += "No ratings found!";
            }
            createMarker(
              place.geometry.location,
              map.current,
              "https://cdn4.iconfinder.com/data/icons/map-pins-2/256/21-512.png",
              content
            );
          }
        }
        props.updateMarkers(markers);
      }
    );
    map.current.addListener("click", function(e) {
      if (infoWindow) {
        infoWindow.close();
      }
      setNewRestaurant(e);
    });
  };

  return (
    <div>
      <div id="map"></div>
      {newRestaurant && (
        <AddRestaurantForm
          addNewRestaurant={addNewRestaurant}
          closeAddRestaurantWindow={closeAddRestaurantWindow}
          newRestaurant={newRestaurant}
        />
      )}
    </div>
  );
}

export default Map;
