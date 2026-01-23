# -*- encoding: utf-8 -*-
# stub: acts_as_tenant 0.6.1 ruby lib

Gem::Specification.new do |s|
  s.name = "acts_as_tenant".freeze
  s.version = "0.6.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Erwin Matthijssen".freeze, "Chris Oliver".freeze]
  s.date = "2023-01-23"
  s.description = "Integrates multi-tenancy into a Rails application in a convenient and out-of-your way manner".freeze
  s.email = ["erwin.matthijssen@gmail.com".freeze, "excid3@gmail.com".freeze]
  s.homepage = "https://github.com/ErwinM/acts_as_tenant".freeze
  s.rubygems_version = "3.3.5".freeze
  s.summary = "Add multi-tenancy to Rails applications using a shared db strategy".freeze

  s.installed_by_version = "3.3.5" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_runtime_dependency(%q<request_store>.freeze, [">= 1.0.5"])
    s.add_runtime_dependency(%q<rails>.freeze, [">= 5.2"])
    s.add_development_dependency(%q<rspec>.freeze, [">= 3.0"])
    s.add_development_dependency(%q<rspec-rails>.freeze, [">= 0"])
    s.add_development_dependency(%q<sqlite3>.freeze, [">= 0"])
    s.add_development_dependency(%q<sidekiq>.freeze, ["~> 6.1", ">= 6.1.2"])
    s.add_development_dependency(%q<standard>.freeze, [">= 0"])
    s.add_development_dependency(%q<appraisal>.freeze, [">= 0"])
  else
    s.add_dependency(%q<request_store>.freeze, [">= 1.0.5"])
    s.add_dependency(%q<rails>.freeze, [">= 5.2"])
    s.add_dependency(%q<rspec>.freeze, [">= 3.0"])
    s.add_dependency(%q<rspec-rails>.freeze, [">= 0"])
    s.add_dependency(%q<sqlite3>.freeze, [">= 0"])
    s.add_dependency(%q<sidekiq>.freeze, ["~> 6.1", ">= 6.1.2"])
    s.add_dependency(%q<standard>.freeze, [">= 0"])
    s.add_dependency(%q<appraisal>.freeze, [">= 0"])
  end
end
