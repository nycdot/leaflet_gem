module LeafletHelper

  # Defaults
  MAPID = "map"
  MINZOOM = 0
  MAXZOOM = 18
  TILE_PROVIDER = 'GOOGLEMAP'
  TILE_STYLE_ID = 997

  # This is the utility method that is called to generate a map. The method simply
  # renders the leaflet partial in views/leaflet and passes the set of options to
  # it
  def LeafletMap(options)
    options_with_indifferent_access = options.with_indifferent_access
    #
    # check the options and fill in any defaults that are missing
    #
    options_with_indifferent_access[:mapid] ||= MAPID
    options_with_indifferent_access[:min_zoom] ||= MINZOOM
    options_with_indifferent_access[:max_zoom] ||= MAXZOOM
    options_with_indifferent_access[:tile_provider] ||= TILE_PROVIDER
    options_with_indifferent_access[:tile_style_id] ||= TILE_STYLE_ID

    #puts options.inspect
    render :partial => '/leaflet/leaflet', :locals  => { :options => options.with_indifferent_access }

  end
  # This helper method is called from the leaflet partial and has the options that
  # were passed in from the partial itself
  #
  # This code is reponsible for generating the javascript to render the map and any
  # markers that have been passed in.
  def generate_map(options)

    options_with_indifferent_access = options.with_indifferent_access

    js = []
    # Add any icon definitions
    js << options_with_indifferent_access[:icons] unless options_with_indifferent_access[:icons].nil?

    #puts options_with_indifferent_access.inspect

    # initialize the map with the map div and any options
    js << "leaflet_tools.init('#{options_with_indifferent_access[:mapid]}', #{options_with_indifferent_access.to_json});"

    # add any markers
    js << "leaflet_tools.add_markers(#{options_with_indifferent_access[:markers]});" unless options_with_indifferent_access[:markers].nil?
    # add any circles
    js << "leaflet_tools.add_circles(#{options_with_indifferent_access[:circles]});" unless options_with_indifferent_access[:circles].nil?
    # add any polylines
    js << "leaflet_tools.add_polylines(#{options_with_indifferent_access[:polylines]});" unless options_with_indifferent_access[:polylines].nil?

    map_bounds = SystemConfig.instance.map_bounds
    js << "leaflet_tools.set_map_bounds(#{map_bounds[0][0]},#{map_bounds[0][1]},#{map_bounds[1][0]},#{map_bounds[1][1]});"
    js << "leaflet_tools.show_map();"
    js * ("\n")
  end
end
