const x = document.getElementById("demo");  // For displaying location error messsages

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function success(position) {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  }
}

function error() {
  alert("Sorry, no position available.");
}