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
  $('#interested').submit(function(e) {
    var id = $(this.meetup_id).val()
      , csrf = $(this._csrf).val()
    e.preventDefault();

    $.ajax({
      url: '/toys/'+id+'/borrow',
      type: 'PUT',
      data: {_csrf: csrf},
      dataType: "json",
      success: function(result) {
        var node = $('#feedback-box')
        node.removeClass('hide')
        if (result.status === 'ok') {
          node.html("Updated Facebook successfully").addClass('alert-success')
        } else {
          node.html(result.message.message).addClass('alert-danger')
        }
      }
    })
  })
});
