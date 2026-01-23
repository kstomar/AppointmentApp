module Tenantable
  extend ActiveSupport::Concern

  included do
    belongs_to :tenant
    
    validates :tenant, presence: true
    
    default_scope { where(tenant_id: ActsAsTenant.current_tenant&.id) if ActsAsTenant.current_tenant }
  end
end
