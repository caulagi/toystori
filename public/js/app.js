function showMap(address) {
  console.log(address)
  var pos, mapOptions, map, marker;
  pos = new google.maps.LatLng(address.latitude, address.longitude);
  mapOptions = {
    zoom: 7,
    center: pos,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  marker = new google.maps.Marker({
    position: pos,
    map: map,
    title: 'Toy listing'
  });
}
