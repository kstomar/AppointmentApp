class StaffService < ApplicationRecord
  monetize :custom_price_cents, allow_nil: true

  belongs_to :staff_member
  belongs_to :service

  validates :staff_member_id, uniqueness: { scope: :service_id }
  validates :custom_duration_minutes, numericality: { greater_than: 0, allow_nil: true }

  scope :active, -> { where(is_active: true) }

  def effective_price
    custom_price || service.price
  end

  def effective_duration_minutes
    custom_duration_minutes || service.duration_minutes
  end
end
