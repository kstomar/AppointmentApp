# -*- encoding: utf-8 -*-
# stub: pundit 2.5.2 ruby lib

Gem::Specification.new do |s|
  s.name = "pundit".freeze
  s.version = "2.5.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/varvet/pundit/issues", "changelog_uri" => "https://github.com/varvet/pundit/blob/main/CHANGELOG.md", "documentation_uri" => "https://github.com/varvet/pundit/blob/main/README.md", "homepage_uri" => "https://github.com/varvet/pundit", "rubygems_mfa_required" => "true", "source_code_uri" => "https://github.com/varvet/pundit" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jonas Nicklas".freeze, "Varvet AB".freeze]
  s.date = "2025-09-24"
  s.description = "Object oriented authorization for Rails applications".freeze
  s.email = ["jonas.nicklas@gmail.com".freeze, "info@varvet.com".freeze]
  s.homepage = "https://github.com/varvet/pundit".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.3.5".freeze
  s.summary = "OO authorization for Rails".freeze

  s.installed_by_version = "3.3.5" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_runtime_dependency(%q<activesupport>.freeze, [">= 3.0.0"])
  else
    s.add_dependency(%q<activesupport>.freeze, [">= 3.0.0"])
  end
end
