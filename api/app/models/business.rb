class Business < ApplicationRecord
  include Tenantable
  include Discardable
  include Auditable

  INDUSTRIES = %w[healthcare beauty wellness fitness home_services professional_services education other].freeze
  STATUSES = %w[active inactive suspended].freeze

  belongs_to :owner, class_name: 'User', inverse_of: :businesses
  has_many :locations, dependent: :destroy
  has_many :services, dependent: :destroy
  has_many :staff_members, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :invoices, dependent: :destroy
  has_many :intake_forms, dependent: :destroy
  has_many :notification_templates, dependent: :destroy
  has_many :webhooks, dependent: :destroy
  has_many :api_keys, dependent: :destroy
  has_many :availability_rules, dependent: :destroy
  has_many :waitlist_entries, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
    validates :slug, presence: true,
                     uniqueness: { case_sensitive: false },
                     format: { with: /\A[a-z0-9\-]+\z/, message: 'must be lowercase alphanumeric with hyphens' },
                     length: { minimum: 3, maximum: 100 }
  validates :industry, presence: true, inclusion: { in: INDUSTRIES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :timezone, presence: true
  validates :currency, presence: true, length: { is: 3 }
  validates :booking_lead_time_minutes, numericality: { greater_than_or_equal_to: 0 }
  validates :booking_window_days, numericality: { greater_than: 0 }
  validates :cancellation_policy_hours, numericality: { greater_than_or_equal_to: 0 }
  validates :deposit_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }

  before_validation :generate_slug, on: :create

  scope :active, -> { where(status: 'active') }
  scope :by_industry, ->(industry) { where(industry: industry) }

  def active?
    status == 'active'
  end

  def primary_location
    locations.find_by(is_primary: true) || locations.first
  end

    def booking_url
      "#{Rails.application.config.app_domain}/#{slug}/book"
    end

  def can_accept_bookings?
    active? && services.active.exists? && staff_members.bookable.exists?
  end

  def setting(key)
    settings.dig(key.to_s)
  end

  def booking_setting(key)
    booking_settings.dig(key.to_s)
  end

  private

  def generate_slug
    return if slug.present?
    
    base_slug = name.to_s.parameterize
    self.slug = base_slug
    
    counter = 1
        while Business.exists?(slug: slug)
          self.slug = "#{base_slug}-#{counter}"
          counter += 1
        end
  end
end
