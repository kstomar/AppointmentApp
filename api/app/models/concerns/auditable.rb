module Auditable
  extend ActiveSupport::Concern

  included do
    has_paper_trail(
      on: [:create, :update, :destroy],
      ignore: [:updated_at, :created_at]
    )
  end
end
