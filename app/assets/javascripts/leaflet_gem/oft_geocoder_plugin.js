if (typeof console == "undefined") {
  this.console = { log: function (msg) { /* do nothing since it would otherwise break IE */} };
}


L.Control.OftGeocoder = L.Control.extend({
  options: {
    collapsed: true,
    position: 'topleft',
    text: 'Locate'
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);

    this._map = null;
    this._container = null;

  },

  onAdd: function (map) {
    this._map = map;

    var class_name = 'leaflet-control-oft-geocoder';
    var container = this._container = L.DomUtil.create('div', class_name);

    L.DomEvent.disableClickPropagation(container);

    var form = this._form = L.DomUtil.create('form', class_name + '-form');
    form.className += ' form-vertical';

    var on_street_input = this._on_street_input = document.createElement('input');
    on_street_input.type = "text";
    on_street_input.className = 'string optional form-control';
    on_street_input.setAttribute("placeholder","Street Number...");

    var from_street_input = this._from_street_input = document.createElement('input');
    from_street_input.type = "text";
    from_street_input.className = 'string optional form-control';
    from_street_input.setAttribute("placeholder","From street...");

    var to_street_input = this._to_street_input = document.createElement('input');
    to_street_input.type = "text";
    to_street_input.className = 'string optional form-control';
    to_street_input.setAttribute("placeholder","To street...");

    var submit = document.createElement('input');
    submit.type = "submit";
    submit.value = this.options.text;
    submit.className += 'btn btn-primary btn-sm';

    form.appendChild(on_street_input);
    form.appendChild(from_street_input);
    form.appendChild(to_street_input);
    form.appendChild(submit);

    L.DomEvent.addListener(form, 'submit', this._geocode, this);

    if (this.options.collapsed) {
      L.DomEvent.addListener(container, 'mouseover', this._expand, this);
      L.DomEvent.addListener(container, 'mouseout', this._collapse, this);

      var link = this._layersLink = L.DomUtil.create('a', class_name + '-toggle', container);
      link.href = '#';
      link.title = 'OFT GeoSupport Geocoder';

      L.DomEvent.addListener(link, L.Browser.touch ? 'click' : 'focus', this._expand, this);

      this._map.on('movestart', this._collapse, this);
    } else {
      this._expand();
    }

    container.appendChild(form);

    return container;
  },

  // Geocode function.
  _geocode : function (event) {
    L.DomEvent.preventDefault(event);

    var options = {
      on_street: this._on_street_input.value,
      from_street: this._from_street_input.value,
      to_street:this._to_street_input.value
    }
    this.options.on_submit_handler(options);

  },

  _expand: function () {
    L.DomUtil.addClass(this._container, 'leaflet-control-oft-geocoder-expanded');
  },

  _collapse: function () {
    this._container.className = this._container.className.replace('leaflet-control-oft-geocoder-expanded', '');
  }
});

L.control.oftGeocoder = function(options) {
  return new L.Control.OftGeocoder(options);
};

L.Map.mergeOptions({
  oftGeocoder: false
});

L.Map.addInitHook(function() {
  if (this.options.oftGeocoder) {
    this.oftGeocoder = new L.Control.OftGeocoder();
    this.addControl(this.oftGeocoder);
  }
});
