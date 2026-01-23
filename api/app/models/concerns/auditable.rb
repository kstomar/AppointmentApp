module Auditable
  extend ActiveSupport::Concern

  included do
    has_paper_trail(
      on: [:create, :update, :destroy],
      ignore: [:updated_at, :created_at],
      meta: {
        tenant_id: ->(record) { record.try(:tenant_id) || ActsAsTenant.current_tenant&.id }
      }
    )
  end
end
