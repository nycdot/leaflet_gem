L.Control.LocateHere = L.Control.extend({
  options: {
    position: 'topleft'
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);

    this._enabled = false;
    this._container = null;
    this._button = null;
    this._buttonD = null;
    this._map = null;

    this._features = new L.FeatureGroup();
    this._selectPoint = null;
  },

  onAdd: function (map) {
    this._map = map;
    this._features.addTo(map);

    this._container = L.DomUtil.create('div', 'leaflet-toolbar leaflet-control-locate-here leaflet-bar leaflet-control');
    this._button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-control-locate-here', this._container);
    this._button.href = '#';
    //this._button.innerHTML = '&#8659;';
    this._button.title = 'Locate Here';

    L.DomEvent
    .on(this._button, 'click', L.DomEvent.stopPropagation)
    .on(this._button, 'mousedown', L.DomEvent.stopPropagation)
    .on(this._button, 'dblclick', L.DomEvent.stopPropagation)
    .on(this._button, 'click', L.DomEvent.preventDefault)
    .on(this._button, 'click', this._onClick, this);

    return this._container;
  },

  _enable: function() {
    this._selectPoint = null;

    this._features.clearLayers();

    this._enabled = true;
    L.DomUtil.addClass(this._button, 'leaflet-toolbar-enabled');
    this._map.on('click', this._onMapClick, this);

    // Call a call back if it exists
    if (this.options.on_enable) {
      this.options.on_enable();
    }

  },
  _disable: function() {
    this._enabled = false;
    L.DomUtil.removeClass(this._button, 'leaflet-toolbar-enabled');
    // Remove the marker
    this._features.clearLayers();
    // Call the call back if it exists
    if (this.options.on_disable) {
      this.options.on_disable();
    }

    this._map.off('click', this._onMapClick, this);
  },

  _onClick: function() {
    if (this._enabled)
      this._disable();
    else
      this._enable();
  },

  _onMapClick: function(e) {
    var marker = new L.Marker(e.latlng, { draggable: true });
    marker.bindPopup('Lng: ' + e.latlng.lng.toFixed(6) + '<br />Lat: ' + e.latlng.lat.toFixed(6));
    marker.on('drag', this._onMarkerDrag, this);
    marker.on('dragend', this._onMarkerDragEnd, this);

    this._features.addLayer(marker);

    if (this._selectPoint === null) {
      this._selectPoint = e.latlng;
    }
    if (this.options.on_map_click) {
      this.options.on_map_click(e.latlng);
    }
  },

  _onMarkerDrag: function(e) {
    var marker = e.target;
    this._selectPoint = marker.getLatLng();
  },
  _onMarkerDragEnd: function(e) {
    var marker = e.target;
    if (this.options.on_drag_end) {
      this.options.on_drag_end(marker.getLatLng());
    }
  }
});

L.control.locateHere = function(options) {
  return new L.Control.LocateHere(options);
};

L.Map.mergeOptions({
  locateHere: false
});

L.Map.addInitHook(function() {
  if (this.options.locateHere) {
    this.locateHere = new L.Control.LocateHere();
    this.addControl(this.locateHere);
  }
});
