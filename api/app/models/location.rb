class Location < ApplicationRecord
  include Tenantable
  include Discardable
  include Auditable

  STATUSES = %w[active inactive].freeze

  belongs_to :tenant
  belongs_to :business
  has_many :staff_members, dependent: :nullify
  has_many :bookings, dependent: :nullify
  has_many :availability_rules, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :timezone, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :latitude, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90, allow_nil: true }
  validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180, allow_nil: true }

  before_save :ensure_single_primary

  scope :active, -> { where(status: 'active') }
  scope :primary, -> { where(is_primary: true) }
  scope :virtual, -> { where(is_virtual: true) }
  scope :physical, -> { where(is_virtual: false) }

  def active?
    status == 'active'
  end

  def full_address
    [address_line1, address_line2, city, state, postal_code, country_code]
      .compact
      .reject(&:blank?)
      .join(', ')
  end

  def coordinates
    return nil unless latitude && longitude
    { lat: latitude, lng: longitude }
  end

  def operating_hours_for_day(day_of_week)
    operating_hours[day_of_week.to_s] || operating_hours[day_of_week.to_i.to_s]
  end

  def open_on?(day_of_week)
    hours = operating_hours_for_day(day_of_week)
    hours.present? && hours['open'] != false
  end

  private

  def ensure_single_primary
    return unless is_primary? && is_primary_changed?
    
    business.locations.where.not(id: id).update_all(is_primary: false)
  end
end
