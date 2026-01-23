class Tenant < ApplicationRecord
  include Discardable
  include Auditable

  INDUSTRIES = %w[healthcare beauty wellness fitness home_services professional_services education other].freeze
  STATUSES = %w[active suspended cancelled trial].freeze
  PLANS = %w[free starter professional enterprise].freeze

  has_many :users, dependent: :destroy
  has_many :businesses, dependent: :destroy
  has_many :locations, dependent: :destroy
  has_many :services, dependent: :destroy
  has_many :staff_members, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :calendar_integrations, dependent: :destroy
  has_many :intake_forms, dependent: :destroy
  has_many :audit_logs, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :subdomain, presence: true, 
                        uniqueness: { case_sensitive: false },
                        format: { with: /\A[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\z/i, message: 'must be alphanumeric with optional hyphens' },
                        length: { minimum: 3, maximum: 63 }
  validates :custom_domain, uniqueness: { case_sensitive: false, allow_nil: true },
                            format: { with: /\A[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}\z/i, allow_nil: true }
  validates :industry, presence: true, inclusion: { in: INDUSTRIES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :plan, presence: true, inclusion: { in: PLANS }
  validates :timezone, presence: true
  validates :currency, presence: true, length: { is: 3 }

  before_validation :normalize_subdomain

  scope :active, -> { where(status: 'active') }
  scope :by_industry, ->(industry) { where(industry: industry) }

  def active?
    status == 'active'
  end

  def trial?
    status == 'trial'
  end

  def trial_expired?
    trial? && trial_ends_at.present? && trial_ends_at < Time.current
  end

  def subscription_active?
    subscription_ends_at.nil? || subscription_ends_at > Time.current
  end

  def hipaa_compliant?
    hipaa_enabled?
  end

  def feature_enabled?(feature_name)
    features[feature_name.to_s] == true
  end

  private

  def normalize_subdomain
    self.subdomain = subdomain&.downcase&.strip
  end
end
