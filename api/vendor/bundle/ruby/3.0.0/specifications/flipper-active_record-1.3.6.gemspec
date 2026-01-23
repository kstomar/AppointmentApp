# -*- encoding: utf-8 -*-
# stub: flipper-active_record 1.3.6 ruby lib

Gem::Specification.new do |s|
  s.name = "flipper-active_record".freeze
  s.version = "1.3.6"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/flippercloud/flipper/issues", "changelog_uri" => "https://github.com/flippercloud/flipper/releases/tag/v1.3.6", "documentation_uri" => "https://www.flippercloud.io/docs", "funding_uri" => "https://github.com/sponsors/flippercloud", "homepage_uri" => "https://www.flippercloud.io", "source_code_uri" => "https://github.com/flippercloud/flipper" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["John Nunemaker".freeze]
  s.date = "1980-01-02"
  s.email = "support@flippercloud.io".freeze
  s.homepage = "https://www.flippercloud.io/docs/adapters/active-record".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.3.5".freeze
  s.summary = "ActiveRecord feature flag adapter for Flipper".freeze

  s.installed_by_version = "3.3.5" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_runtime_dependency(%q<flipper>.freeze, ["~> 1.3.6"])
    s.add_runtime_dependency(%q<activerecord>.freeze, [">= 4.2", "< 9"])
  else
    s.add_dependency(%q<flipper>.freeze, ["~> 1.3.6"])
    s.add_dependency(%q<activerecord>.freeze, [">= 4.2", "< 9"])
  end
end
