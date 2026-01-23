class User < ApplicationRecord
  include Tenantable
  include Discardable
  include Auditable

  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :validatable, :confirmable, :lockable, :trackable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  ROLES = %w[super_admin business_admin staff front_desk client].freeze
  STATUSES = %w[active inactive suspended pending].freeze

  belongs_to :tenant
  has_many :businesses, foreign_key: :owner_id, dependent: :nullify, inverse_of: :owner
  has_many :staff_members, dependent: :destroy
  has_many :bookings, foreign_key: :client_id, dependent: :nullify, inverse_of: :client
  has_many :booked_appointments, class_name: 'Booking', foreign_key: :booked_by_id, dependent: :nullify, inverse_of: :booked_by
  has_many :payments, dependent: :nullify
  has_many :notifications, dependent: :destroy
  has_many :calendar_integrations, dependent: :destroy
  has_many :notification_preferences, dependent: :destroy
  has_many :api_keys, dependent: :destroy

  has_encrypted :ssn
  blind_index :ssn

  validates :email, presence: true, 
                    format: { with: URI::MailTo::EMAIL_REGEXP },
                    uniqueness: { scope: :tenant_id, case_sensitive: false }
  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name, presence: true, length: { maximum: 100 }
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :phone, phone: { allow_blank: true, types: [:mobile, :fixed_line] }

  before_validation :normalize_email

  scope :active, -> { where(status: 'active') }
  scope :by_role, ->(role) { where(role: role) }
  scope :staff, -> { where(role: %w[business_admin staff front_desk]) }
  scope :clients, -> { where(role: 'client') }

  def full_name
    "#{first_name} #{last_name}".strip
  end

  def display_name
    full_name.presence || email
  end

  def super_admin?
    role == 'super_admin'
  end

  def business_admin?
    role == 'business_admin'
  end

  def staff?
    role == 'staff'
  end

  def front_desk?
    role == 'front_desk'
  end

  def client?
    role == 'client'
  end

  def can_manage_business?(business)
    super_admin? || (business_admin? && businesses.include?(business))
  end

  def can_manage_staff?(staff_member)
    super_admin? || can_manage_business?(staff_member.business)
  end

  def active?
    status == 'active'
  end

  def effective_timezone
    timezone.presence || tenant&.timezone || 'UTC'
  end

  private

  def normalize_email
    self.email = email&.downcase&.strip
  end
end
