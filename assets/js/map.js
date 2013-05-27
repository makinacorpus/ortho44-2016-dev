var Ortho44 = {
  _callbackIndex: 0,

  bindGeocode: function(form, input, map, callback) {
    L.DomEvent.addListener(form, 'submit', this._geocode, this);
    this._map = map;
    this._input = input;
    this._callback = callback;
    // Restrict to Loire-Atlantique
    this._bounds = new L.LatLngBounds(new L.LatLng(46.86008, -2.55754), new L.LatLng(47.83486, -0.92346));
  },

  _geocode: function (event) {
    L.DomEvent.preventDefault(event);
    //http://wiki.openstreetmap.org/wiki/Nominatim
    var callbackId = "_l_ortho44geocoder_" + (this._callbackIndex++);
    window[callbackId] = L.Util.bind(this._callback, this);

    /* Set up params to send to Nominatim */
    var params = {
      // Defaults
      q: this._input.value,
      json_callback : callbackId,
      format: 'json'
    };

    if( this._bounds instanceof L.LatLngBounds ) {
      params.viewbox = this._bounds.toBBoxString();
      params.bounded = 1;
    } else {
      console.log('bounds must be of type L.LatLngBounds');
      return;
    }

    var url = "http://nominatim.openstreetmap.org/search" + L.Util.getParamString(params);
    var script = document.createElement("script");

    script.type = "text/javascript";
    script.src = url;
    script.id = callbackId;
    document.getElementsByTagName("head")[0].appendChild(script);
  }
};

window.onload=function(){
  var map = L.map('map').setView([47.12, -1.40], 11);

  var streets = L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-20v6611k/{z}/{x}/{y}.png', {
    opacity: 0.5,
    maxZoom: 18
  }); //.addTo(map);

  var ortho2012 = L.tileLayer('http://{s}.tiles.cg44.makina-corpus.net/ortho2012/{z}/{x}/{y}.png', {
    continuousWorld: true,  // very important
    tms: true,
    maxZoom: 18
  }).addTo(map);

  var baseMaps = {
    "Orthophotographie 2012": ortho2012
  };
  var overlayMaps = {
    "Rues": streets
  };
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  L.control.scale().addTo(map);

  Ortho44.bindGeocode(document.getElementById('search-address'), document.getElementById("search-input"), map, function (results) {
      console.log(results);
      if(results.length > 0) {
        var bbox = results[0].boundingbox,
          first = new L.LatLng(bbox[0], bbox[2]),
          second = new L.LatLng(bbox[1], bbox[3]),
          bounds = new L.LatLngBounds([first, second]);
        Ortho44._map.fitBounds(bounds);
      }
    });
}