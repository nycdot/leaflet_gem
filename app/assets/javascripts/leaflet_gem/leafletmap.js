// Leaflet map rendering functions

var leaflet_tools = new function() {
	/*
	 * Add a set of markers to the map. Markers are defined as an array of json hashes. Each
	 * JSON hash has values latitude, longitude, iconClass, popupText, open
	 */
	var LMmarkers = new Array();
	var LMcircles = new Array();
	var LMpolylines = new Array();
	var LMmap;
	var LMbounds;
	var LMcurrent_popup;

	var OPENSTREETMAP_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var OPENSTREETMAP_ATTRIB = 'Map data © OpenStreetMap contributors';

	var CLOUDMADE_URL = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/{styleId}/256/{z}/{x}/{y}.png';
	var CLOUDMADE_ATTRIB = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="http://cloudmade.com">CloudMade</a>';

  this.markers = function() {
		return LMmarkers;
	}
	this.map = function() {
		return LMmap;
	}
	this.map_bounds = function() {
		return LMbounds;
	}
	this.current_popup = function() {
		return LMcurrent_popup;
	}
	/*
	 * Must be called first. Pass the Id of the div containing the map and any options
	 * that should be passed to the map constructor
	 */
	this.init = function(mapId, options) {
		LMmap = L.map(mapId);
		//alert(options.tile_provider);
		//alert(options.min_zoom);
		//alert(options.max_zoom);
		if (options.tile_provider == 'OPENSTREETMAP') {
			var mapUrl = OPENSTREETMAP_URL;
			var mapAttrib = OPENSTREETMAP_ATTRIB;
			L.tileLayer(mapUrl, {minZoom: options.min_zoom, maxZoom: options.max_zoom, attribution: mapAttrib}).addTo(LMmap);
		} else if (options.tile_provider == 'GOOGLEMAP') {
			var googleLayer = new L.Google('ROADMAP');
	    LMmap.addLayer(googleLayer);
		} else {
			var mapUrl = CLOUDMADE_URL;
			var mapAttrib = CLOUDMADE_ATTRIB;
			L.tileLayer(mapUrl, {minZoom: options.min_zoom, maxZoom: options.max_zoom, attribution: mapAttrib, styleId: options.tile_style_id}).addTo(LMmap);
		}
		// install a popup listener
		LMmap.on('popupopen', function(event){
			//alert('popup opened');
			LMcurrent_popup = event.popup;
		});
	};
	/*
	 * Adds a click handler to the map
	 */
	this.add_click_handler = function(event, handler) {
		LMmap.on(event, handler);
	};
	/*
	 * Removes a click handler from the map
	 */
	this.remove_click_handler = function(event, handler) {
		LMmap.off(event, handler);
	};
	/**
	 *
	 * Centers the map on a specified marker without changing the zoom level
	 */
	this.center_on_marker = function(markerId) {
		var marker = find_marker_by_id(markerId);
		if (marker) {
			var latlng = marker.getLatLng();
			this.pan_to(latlng.lat, latlng.lng);
		}
	};
	/*
	 * Pans the map to a gven coordinate without changing the zoom level
	 */
	this.pan_to = function(lat, lng) {
		var latlng = new L.LatLng(lat, lng);
		LMmap.panTo(latlng);
	};
	/*
	 * Called last after the map has been configured.
	 */
	this.show_map = function() {
		// Add the markers to the map
		for (var i=0;i<LMmarkers.length;i++) {
			LMmap.addLayer(LMmarkers[i]);
		}
		// Add the circles to the map
		for (var i=0;i<LMcircles.length;i++) {
			LMmap.addLayer(LMcircles[i]);
		}
		// Add the polylines to the map
		for (var i=0;i<LMpolylines.length;i++) {
			LMmap.addLayer(LMpolylines[i]);
		}
		var mapBounds;
		if (LMmarkers.length > 0) {
			mapBounds = this.calc_map_bounds(LMmarkers);
		} else {
			mapBounds = LMbounds;
		}
		LMmap.fitBounds(mapBounds);
	};
	/*
	 * Replaces the markers on the map with a new set
	 */
	this.replace_markers = function(arr, update_map) {
		//alert('Replacing Markers');
		this.remove_markers();
		this.add_markers(arr);
		if (update_map) {
			//alert('Updating map');
			this.show_map();
		} else {
			// Add the markers to the map
			for (var i=0;i<LMmarkers.length;i++) {
				LMmap.addLayer(LMmarkers[i]);
			}
		}
	};
	/*
	 * Removes the markers from the map and re-draws them from
	 * the markers array
	 */
	this.refresh_markers = function() {
		for(var i=0;i<LMmarkers.length;i++){
			LMmap.removeLayer(LMmarkers[i]);
		}
		// Add the markers to the map
		for (var i=0;i<LMmarkers.length;i++) {
			LMmap.addLayer(LMmarkers[i]);
		}
	};
	/*
	 * Replaces the circles on the map with a new set
	 */
	this.replace_circles = function(arr, update_map) {
		//alert('Replacing Circles');
		this.remove_circles();
		this.add_circles(arr);
		if (update_map) {
			//alert('Updating map');
			this.show_map();
		} else {
			for (var i=0;i<LMcircles.length;i++) {
				LMmap.addLayer(LMcircles[i]);
			}
		}
	};
	/*
	 * Replaces the polylines on the map with a new set
	 */
	this.replace_polylines = function(arr, update_map) {
		//alert('Replacing Polylines');
		this.remove_polylines();
		this.add_polylines(arr);
		if (update_map) {
			//alert('Updating map');
			this.show_map();
		} else {
			for (var i=0;i<LMpolylines.length;i++) {
				LMmap.addLayer(LMpolylines[i]);
			}
		}
	};
	/*
	 *
	 */
	this.remove_markers = function() {
		// Loop through the markers and remove them from the map
		//alert('Removing markers from map');
		for(var i=0;i<LMmarkers.length;i++){
			//alert('Removing Marker ' + LMmarkers[i].id);
			LMmap.removeLayer(LMmarkers[i]);
		}
		LMmarkers = new Array();
	};
	/*
	 *
	 */
	this.remove_circles = function() {
		// Loop through the circles and remove them from the map
		for(var i=0;i<LMcircles.length;i++){
			LMmap.removeLayer(LMcircles[i]);
		}
		LMcircles = new Array();
	};
	/*
	 *
	 */
	this.remove_polylines = function() {
		// Loop through the polylines and remove them from the map
		for(var i=0;i<LMpolylines.length;i++){
			LMmap.removeLayer(LMpolylines[i]);
		}
		LMpolylines = new Array();
	};
	/*
	 * Processes an array of json objects containing marker definitions and adds them
	 * to the array of markers
	 */
	this.add_markers = function(arr) {
		//alert('Adding ' + arr.length + ' markers');

		for(var i=0;i < arr.length;i++){
	    var obj = arr[i];
			if (obj.lat == null || obj.lng == null) {
				continue;
			}
      var id = obj.id;
      var lat = obj.lat;
      var lng = obj.lng;
      var iconClass = obj.iconClass;
      var popupText = obj.description;
      var title = obj.title;
      var zindex = obj.zindex;
      var open = false;
      if (obj.open) {
      	open = obj.open;
      }
      var draggable = obj.draggable;
      marker = this.create_marker(id, lat, lng, iconClass, popupText, title, open, draggable, zindex);

	   	// Add this marker to the list of markers
			LMmarkers.push(marker);
	  }
	};
	// Adds a marker to the map and optionally puts it in the cache
	this.add_marker_to_map = function(marker, cache) {
		if (cache) {
		 	// Add this marker to the list of markers
			this.add_marker_to_cache(marker);
		}
		LMmap.addLayer(marker);
	};
	// Adds a marker to the map and optionally puts it in the cache
	this.add_marker_to_cache = function(marker) {
		LMmarkers.push(marker);
	};
	// Removes a marker from the map and removes it from the cache
	// if it is stored there
	this.remove_marker_from_map = function(marker) {
		var markers = new Array();
		for (var i = 0; i < LMmarkers.length; i++) {
			if (marker == LMmarkers[i]) {
				continue;
			} else {
				markers.push(LMmarkers[i]);
			}
		}
		LMmarkers = markers;
		LMmap.removeLayer(marker);
	};
	// Removes markers with an id matching the input string
	this.remove_matching_markers = function(match) {
		var markers = new Array();
		for (var i = 0; i < LMmarkers.length; i++) {
			var marker = LMmarkers[i];
			var id = marker.id;
			if (id != null && id.indexOf(match) !=-1) {
				LMmap.removeLayer(marker);
				continue;
			} else {
				markers.push(marker);
			}
		}
		LMmarkers = markers;
	}
	/*
	 *
	 */
	this.add_circles = function(arr) {
		for(var i=0;i<arr.length;i++) {
      var obj = arr[i];
      var lat = obj.lat;
      var lng = obj.lng;
      var radius = obj.radius;
      var options = {};
      if (obj.options) {
      	options = obj.options;
      }
			this.add_circle(lat, lng, radius, options);
		}
	};
	/*
	 *
	 */
	this.add_polylines = function(arr) {
		for(var i=0;i<arr.length;i++) {
      var obj = arr[i];
      var id = obj.id;
      var geom = obj.geom;
      var options = {};
      if (obj.options) {
      	options = obj.options;
      }
			this.add_polyline(geom, options);
		}
	};

	this.select_marker_by_id = function(id) {
		marker = this.find_marker_by_id(id);
		console.log(marker.id);
		if (marker) {
			this.select_marker(marker);
		}
	};
	this.select_marker_by_name = function(name) {
		marker = this.find_marker_by_name(name);
		if (marker) {
			this.select_marker(marker);
		}
	};
	this.find_marker_by_id = function(id) {
		for (var i=0;i<LMmarkers.length;i++) {
			if (LMmarkers[i].id == id) {
				return LMmarkers[i];
			}
		}
	};
	this.find_marker_by_name = function(name) {
		for (var i=0;i<LMmarkers.length;i++) {
			if (LMmarkers[i].name === name) {
				return LMmarkers[i];
			}
		}
	};

	/*
	 * Creates a single marker and returns it. If the iconClass is set
	 * then the iconClass must be defined in the page
	 */
	this.create_marker = function(id, lat, lng, iconClass, popupText, name, open, draggable, zindex) {

		//alert(id + "," + lat + "," + lng + "," + popupText + "," + name + "," + open);

		var options = {
			"title" : name,
			"draggable" : draggable,
			"zIndexOffset" : zindex
		};
		var latlng = new L.LatLng(lat, lng);
		var marker = L.marker(latlng, options);
		marker.id = id;
		marker.name = name;
		if (iconClass) {
			//alert(iconClass);
			marker.setIcon(eval(iconClass));
		}
		// Add the popup text and mark for open on init if needed
		if (popupText) {
			marker.bindPopup(popupText).openPopup();
			if (open) {
				marker.openPopup();
			}
		}
		return marker;
	};
	/*
	 * Adds a polyline from a json hash. arr is an array of arrays
	 * where each sub array has length 2
	 */
	this.add_polyline = function(arr, options) {

		var latlngs = new Array();
		for (var i = 0; i < arr.length; i++) {
			var pnt = arr[i];
			var ll = new L.LatLng(pnt[0], pnt[1]);
			latlngs.push(ll);
		}
		var pline = L.polyline(latlngs, options);

		// Add this polyline to the list of polylines
		LMpolylines.push(pline);

	}
	/*
	 *
	 */
	this.add_circle = function(lat, lng, radius, options) {
		var latlng = new L.LatLng(lat, lng);
		var circle = L.circle(latlng, radius, options);

		// Add this circle to the list of circles
		LMcircles.push(circle);
	};

	/*
	 * Selection function for a marker. This function opens the marker popup,
	 * closes any other popups and pans the map so the marker is centered
	 */
	this.select_marker = function(marker) {
		if (marker) {
			marker.openPopup();
			LMmap.panTo(marker.getLatLng());
		}
	};
	/**
	 * Calculate the maximum geographic extent of the marker set
	 * Needs at least 2 markers
	 */
	this.calc_map_bounds = function(marker_array) {
		if (marker_array == null || marker_array.length < 1 || marker_array[0] == null) {
			return nil;
		}
		var minLat = marker_array[0].getLatLng().lat;
		var minLng = marker_array[0].getLatLng().lng;
		var maxLat = marker_array[0].getLatLng().lat;
		var maxLng = marker_array[0].getLatLng().lng;

		if (marker_array.length > 1) {
			for(var i=1; i<marker_array.length;i++) {
				minLat = minLat < marker_array[i].getLatLng().lat ? minLat : marker_array[i].getLatLng().lat;
				minLng = minLng < marker_array[i].getLatLng().lng ? minLng : marker_array[i].getLatLng().lng;
				maxLat = maxLat > marker_array[i].getLatLng().lat ? maxLat : marker_array[i].getLatLng().lat;
				maxLng = maxLng > marker_array[i].getLatLng().lng ? maxLng : marker_array[i].getLatLng().lng;
			}
		}

		return [[minLat, minLng], [maxLat, maxLng]];
	};
	this.set_map_to_bounds = function(marker_array) {
		if (marker_array == null) {
			marker_array = LMmarkers;
		}
		if (marker_array.length > 0) {
			LMbounds = this.calc_map_bounds(marker_array);
			LMmap.fitBounds(LMbounds);
		}
	};
	this.set_map_bounds = function(minLat, minLon, maxLat, maxLon) {
		LMbounds = [[minLat, minLon], [maxLat, maxLon]];
	};
	this.close_popup = function() {
		if (LMcurrent_popup) {
			LMcurrent_popup._source.closePopup();
		}
	};
	this.invalidate_map = function() {
		//L.Util.requestAnimFrame(LMmap.invalidateSize, LMmap,!1, LMmap._container);
		LMmap.invalidateSize(false);
	};
	this.reset_map = function() {
		this.remove_markers();
		this.remove_circles();
		this.remove_polylines();
		//LMmap.remove();
	};
}();
