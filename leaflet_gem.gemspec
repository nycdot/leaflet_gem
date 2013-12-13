$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "leaflet_gem/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "leaflet_gem"
  s.version     = LeafletGem::VERSION
  s.authors     = ["Julian Ray"]
  s.email       = ["jray@camsys.com"]
  s.homepage    = "http://www.camsys.com"
  s.summary     = "Adds a helper method for creating Leaflet maps."
  s.description = "Description of LeafletGem."

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails"
  
end
