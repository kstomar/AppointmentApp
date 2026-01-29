module Tenantable
  extend ActiveSupport::Concern

  included do
    belongs_to :tenant, optional: true
    
    # Tenant is now optional - no validation required
    # No default scope - all records are accessible globally
  end
end
