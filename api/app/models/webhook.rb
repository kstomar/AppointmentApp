class Webhook < ApplicationRecord
  include Tenantable

  STATUSES = %w[active inactive disabled].freeze
  EVENTS = %w[
    booking.created booking.updated booking.cancelled booking.completed booking.no_show
    payment.completed payment.failed payment.refunded
    client.created client.updated
    staff.created staff.updated
    service.created service.updated
  ].freeze

  belongs_to :tenant
  belongs_to :business, optional: true
  has_many :webhook_deliveries, dependent: :destroy

  validates :url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :valid_events

  before_create :generate_secret

  scope :active, -> { where(status: 'active') }
  scope :for_event, ->(event) { active.where("events @> ?", [event].to_json) }

  def active?
    status == 'active'
  end

  def disabled?
    status == 'disabled'
  end

  def subscribes_to?(event)
    events.include?(event) || events.include?('*')
  end

  def disable!
    update!(status: 'disabled')
  end

  def enable!
    update!(status: 'active', failure_count: 0)
  end

  def record_success!
    update!(
      last_triggered_at: Time.current,
      last_success_at: Time.current,
      failure_count: 0
    )
  end

  def record_failure!(reason)
    new_count = failure_count + 1
    
    update!(
      last_triggered_at: Time.current,
      last_failure_at: Time.current,
      last_failure_reason: reason,
      failure_count: new_count
    )

    disable! if new_count >= 10
  end

  def sign_payload(payload)
    return nil unless secret_digest.present?
    
    OpenSSL::HMAC.hexdigest('SHA256', secret_digest, payload.to_json)
  end

  def verify_signature(payload, signature)
    expected = sign_payload(payload)
    ActiveSupport::SecurityUtils.secure_compare(expected, signature)
  end

  private

  def generate_secret
    secret = SecureRandom.hex(32)
    self.secret_digest = Digest::SHA256.hexdigest(secret)
  end

  def valid_events
    return if events.blank?
    
    invalid = events - EVENTS - ['*']
    if invalid.any?
      errors.add(:events, "contains invalid events: #{invalid.join(', ')}")
    end
  end
end
