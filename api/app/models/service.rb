class Service < ApplicationRecord
  include Tenantable
  include Discardable
  include Auditable

  SERVICE_TYPES = %w[appointment class group_session consultation].freeze
  STATUSES = %w[active inactive archived].freeze

  monetize :price_cents, allow_nil: true
  monetize :deposit_amount_cents, allow_nil: true

  belongs_to :tenant
  belongs_to :business
  belongs_to :category, class_name: 'Service', optional: true, inverse_of: :subcategories
  has_many :subcategories, class_name: 'Service', foreign_key: :category_id, dependent: :nullify, inverse_of: :category
  has_many :staff_services, dependent: :destroy
  has_many :staff_members, through: :staff_services
  has_many :bookings, dependent: :restrict_with_error
  has_many :waitlist_entries, dependent: :destroy
  has_many :intake_forms, dependent: :nullify

  validates :name, presence: true, length: { maximum: 255 }
  validates :slug, presence: true,
                   uniqueness: { scope: :business_id, case_sensitive: false },
                   format: { with: /\A[a-z0-9\-]+\z/, message: 'must be lowercase alphanumeric with hyphens' }
  validates :service_type, presence: true, inclusion: { in: SERVICE_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :duration_minutes, presence: true, numericality: { greater_than: 0 }
  validates :buffer_before_minutes, numericality: { greater_than_or_equal_to: 0 }
  validates :buffer_after_minutes, numericality: { greater_than_or_equal_to: 0 }
  validates :max_attendees, numericality: { greater_than: 0 }
  validates :min_attendees, numericality: { greater_than: 0 }
  validate :max_attendees_greater_than_min

  before_validation :generate_slug, on: :create

  scope :active, -> { where(status: 'active') }
  scope :public_services, -> { where(is_public: true) }
  scope :bookable_online, -> { where(allow_online_booking: true) }
  scope :categories, -> { where(is_category: true) }
  scope :non_categories, -> { where(is_category: false) }
  scope :by_category, ->(category_id) { where(category_id: category_id) }

  def active?
    status == 'active'
  end

  def total_duration_minutes
    duration_minutes + buffer_before_minutes + buffer_after_minutes
  end

  def available_staff
    staff_members.bookable.active
  end

  def group_service?
    max_attendees > 1
  end

  def requires_deposit?
    deposit_amount_cents.present? && deposit_amount_cents > 0
  end

  def intake_form_fields
    intake_form_config['fields'] || []
  end

  private

  def generate_slug
    return if slug.present?
    
    base_slug = name.to_s.parameterize
    self.slug = base_slug
    
    counter = 1
    while Service.exists?(business_id: business_id, slug: slug)
      self.slug = "#{base_slug}-#{counter}"
      counter += 1
    end
  end

  def max_attendees_greater_than_min
    return unless max_attendees && min_attendees
    
    if max_attendees < min_attendees
      errors.add(:max_attendees, 'must be greater than or equal to minimum attendees')
    end
  end
end
