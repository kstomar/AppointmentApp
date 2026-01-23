class CalendarIntegration < ApplicationRecord
  include Tenantable

  PROVIDERS = %w[google_calendar outlook ical].freeze
  STATUSES = %w[active inactive error expired].freeze
  SYNC_DIRECTIONS = %w[bidirectional push_only pull_only].freeze

  has_encrypted :access_token
  has_encrypted :refresh_token

  belongs_to :tenant
  belongs_to :user
  belongs_to :staff_member, optional: true
  has_many :calendar_events, dependent: :destroy

  validates :provider, presence: true, inclusion: { in: PROVIDERS }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :sync_direction, presence: true, inclusion: { in: SYNC_DIRECTIONS }
  validates :user_id, uniqueness: { scope: :provider, message: 'already has this calendar connected' }

  scope :active, -> { where(status: 'active') }
  scope :by_provider, ->(provider) { where(provider: provider) }
  scope :needs_sync, -> { active.where("last_synced_at IS NULL OR last_synced_at < ?", 15.minutes.ago) }
  scope :with_expiring_webhooks, -> { active.where("webhook_expires_at < ?", 1.day.from_now) }

  def active?
    status == 'active'
  end

  def google?
    provider == 'google_calendar'
  end

  def outlook?
    provider == 'outlook'
  end

  def ical?
    provider == 'ical'
  end

  def token_expired?
    token_expires_at.present? && token_expires_at < Time.current
  end

  def token_expiring_soon?
    token_expires_at.present? && token_expires_at < 5.minutes.from_now
  end

  def needs_token_refresh?
    token_expired? || token_expiring_soon?
  end

  def can_push?
    %w[bidirectional push_only].include?(sync_direction)
  end

  def can_pull?
    %w[bidirectional pull_only].include?(sync_direction)
  end

  def mark_synced!
    update!(last_synced_at: Time.current, last_sync_error: nil, last_sync_error_at: nil)
  end

  def mark_sync_error!(error_message)
    update!(last_sync_error: error_message, last_sync_error_at: Time.current)
  end

  def deactivate!(reason = nil)
    update!(status: 'inactive', last_sync_error: reason)
  end

  def update_tokens!(access_token:, refresh_token: nil, expires_at: nil)
    attrs = { access_token: access_token }
    attrs[:refresh_token] = refresh_token if refresh_token.present?
    attrs[:token_expires_at] = expires_at if expires_at.present?
    update!(attrs)
  end

  def webhook_active?
    webhook_channel_id.present? && webhook_expires_at.present? && webhook_expires_at > Time.current
  end
end
