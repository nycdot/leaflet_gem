
L.Control.DrawPolygon = L.Control.extend({
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
    this._polygon_drawer = null;
    this._features = new L.FeatureGroup();
    this._layer = null;
  },

  onAdd: function (map) {
    this._map = map;
    this._features.addTo(map);

    this._container = L.DomUtil.create('div', 'leaflet-control-draw-polygon leaflet-bar leaflet-control');
    this._button = L.DomUtil.create('a', 'leaflet-bar-part', this._container);
    this._button.href = '#';
    this._button.innerHTML = '&#8658;';
    this._button.title = 'Draw Polygon';

    this._polygon_drawer = new L.Draw.Polygon(this._map);

    L.DomEvent
    .on(this._button, 'click', L.DomEvent.stopPropagation)
    .on(this._button, 'mousedown', L.DomEvent.stopPropagation)
    .on(this._button, 'dblclick', L.DomEvent.stopPropagation)
    .on(this._button, 'click', L.DomEvent.preventDefault)
    .on(this._button, 'click', this._onClick, this);

    return this._container;
  },

  _enable: function() {
    this._polygon_drawer.enable();
    this._features.clearLayers();
    this._layer = null;
    this._enabled = true;
    L.DomUtil.addClass(this._button, 'leaflet-control-draw-polygon-enabled');

    // Call a call back if it exists
    if (this.options.on_enable) {
      this.options.on_enable();
    }

  },
  _disable: function() {
    //this._polygon_drawer.disable();
    this._enabled = false;
    this._features.clearLayers();

    L.DomUtil.removeClass(this._button, 'leaflet-control-draw-polygon-enabled');
    // Call the call back if it exists
    if (this.options.on_disable) {
      this.options.on_disable();
    }
  },

  _onClick: function() {
    if (this._enabled)
      this._disable();
    else
      this._enable();
  }

});

L.control.drawPolygon = function(options) {
  return new L.Control.DrawPolygon(options);
};

L.Map.mergeOptions({
  drawPolygon: false
});

L.Map.addInitHook(function() {
  if (this.options.drawPolygon) {
    this.drawPolygon = new L.Control.DrawPolygon();
    this.addControl(this.drawPolygon);
  }
});
