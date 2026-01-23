module Discardable
  extend ActiveSupport::Concern

  included do
    include Discard::Model
    
    default_scope -> { kept }
    
    scope :with_discarded, -> { unscope(where: :discarded_at) }
    scope :only_discarded, -> { with_discarded.discarded }
  end
end
