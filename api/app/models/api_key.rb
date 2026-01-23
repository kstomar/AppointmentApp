class ApiKey < ApplicationRecord
  include Tenantable

  STATUSES = %w[active revoked expired].freeze
  SCOPES = %w[read write bookings:read bookings:write payments:read payments:write staff:read staff:write].freeze

  belongs_to :tenant
  belongs_to :business, optional: true
  belongs_to :user

  validates :name, presence: true, length: { maximum: 255 }
  validates :key_digest, presence: true, uniqueness: true
  validates :key_prefix, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :valid_scopes

  before_validation :generate_key, on: :create

  attr_accessor :raw_key

  scope :active, -> { where(status: 'active').where("expires_at IS NULL OR expires_at > ?", Time.current) }
  scope :revoked, -> { where(status: 'revoked') }
  scope :expired, -> { where("expires_at < ?", Time.current) }

  def active?
    status == 'active' && !expired?
  end

  def revoked?
    status == 'revoked'
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def revoke!
    update!(status: 'revoked', revoked_at: Time.current)
  end

  def touch_last_used!
    update_column(:last_used_at, Time.current)
  end

  def has_scope?(scope)
    return true if scopes.include?('*')
    return true if scopes.include?(scope)
    
    base_scope = scope.split(':').first
    scopes.include?("#{base_scope}:*") || scopes.include?(base_scope)
  end

  def can_read?
    has_scope?('read') || has_scope?('*')
  end

  def can_write?
    has_scope?('write') || has_scope?('*')
  end

  def self.authenticate(key)
    return nil if key.blank?
    
    prefix = key[0..7]
    api_key = find_by(key_prefix: prefix)
    return nil unless api_key
    
    if BCrypt::Password.new(api_key.key_digest) == key
      api_key.touch_last_used!
      api_key.active? ? api_key : nil
    else
      nil
    end
  end

  private

  def generate_key
    return if key_digest.present?
    
    self.raw_key = SecureRandom.hex(32)
    self.key_prefix = raw_key[0..7]
    self.key_digest = BCrypt::Password.create(raw_key)
  end

  def valid_scopes
    return if scopes.blank?
    
    invalid = scopes - SCOPES - ['*']
    if invalid.any?
      errors.add(:scopes, "contains invalid scopes: #{invalid.join(', ')}")
    end
  end
end
