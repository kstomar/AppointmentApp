class StaffMember < ApplicationRecord
  include Tenantable
  include Discardable
  include Auditable

  ROLES = %w[owner manager staff].freeze
  STATUSES = %w[active inactive on_leave].freeze

  belongs_to :tenant
  belongs_to :business
  belongs_to :user
  belongs_to :location, optional: true
  has_many :staff_services, dependent: :destroy
  has_many :services, through: :staff_services
  has_many :bookings, dependent: :nullify
  has_many :availability_rules, dependent: :destroy
  has_many :time_off_requests, dependent: :destroy
  has_many :calendar_integrations, dependent: :destroy
  has_many :waitlist_entries, dependent: :nullify

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :user_id, uniqueness: { scope: :business_id, message: 'is already a staff member of this business' }
  validates :max_daily_bookings, numericality: { greater_than: 0, allow_nil: true }

  delegate :email, :first_name, :last_name, :full_name, :phone, to: :user

  scope :active, -> { where(status: 'active') }
  scope :bookable, -> { where(is_bookable: true, status: 'active') }
  scope :accepting_new_clients, -> { where(accepts_new_clients: true) }
  scope :by_location, ->(location_id) { where(location_id: location_id) }
  scope :with_skill, ->(skill) { where("skills @> ?", [skill].to_json) }

  def active?
    status == 'active'
  end

  def available?
    active? && is_bookable?
  end

  def display_name
    title.presence || user.full_name
  end

  def can_provide_service?(service)
    services.include?(service)
  end

  def has_skill?(skill)
    skills.include?(skill.to_s)
  end

  def daily_booking_count(date)
    bookings.where(start_at: date.beginning_of_day..date.end_of_day)
            .where.not(status: %w[cancelled no_show])
            .count
  end

  def at_daily_limit?(date)
    return false unless max_daily_bookings
    
    daily_booking_count(date) >= max_daily_bookings
  end

  def effective_timezone
    location&.timezone || business.timezone
  end
end
