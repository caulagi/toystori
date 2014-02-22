function showMap(address) {
  var pos, mapOptions, map, marker;
  pos = new google.maps.LatLng(address.latitude, address.longitude);
  mapOptions = {
    zoom: 8,
    center: pos,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  marker = new google.maps.Marker({
    position: pos,
    map: map,
    title: address.venue
  });
}

$(document).ready(function () {
});
