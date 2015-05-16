
L.Control.Button = L.Control.extend({
  options: {
    position: 'topleft'
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);

    this._enabled = false;
    this._container = null;
    this._button = null;
    this._map = null;
  },

  onAdd: function (map) {
    this._map = map;

    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    this._button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-control-custom-button', this._container);
    this._button.href = '#';
    this._button.innerHTML = this.options.asciiCode;
    this._button.title = this.options.title;

    L.DomEvent
    .on(this._button, 'click', L.DomEvent.stopPropagation)
    .on(this._button, 'mousedown', L.DomEvent.stopPropagation)
    .on(this._button, 'dblclick', L.DomEvent.stopPropagation)
    .on(this._button, 'click', L.DomEvent.preventDefault)
    .on(this._button, 'click', this._onClick, this);

    return this._container;
  },
  _enable: function() {
    this._enabled = true;
    L.DomUtil.addClass(this._button, 'leaflet-button-enabled');
    // Call a call back if it exists
    if (this.options.on_enable) {
      this.options.on_enable();
    }
  },
  _disable: function() {
    this._enabled = false;

    L.DomUtil.removeClass(this._button, 'leaflet-button-enabled');
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

L.control.button = function(options) {
  return new L.Control.Button(options);
};

L.Map.mergeOptions({
  button: false
});

L.Map.addInitHook(function() {
  if (this.options.button) {
    this.button = new L.Control.Button();
    this.addControl(this.button);
  }
});
