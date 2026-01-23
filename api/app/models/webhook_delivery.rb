class WebhookDelivery < ApplicationRecord
  STATUSES = %w[pending processing delivered failed].freeze
  MAX_ATTEMPTS = 5

  belongs_to :webhook

  validates :event_type, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }

  scope :pending, -> { where(status: 'pending') }
  scope :failed, -> { where(status: 'failed') }
  scope :delivered, -> { where(status: 'delivered') }
  scope :retriable, -> { 
    where(status: 'failed')
      .where("attempt_count < ?", MAX_ATTEMPTS)
      .where("next_retry_at IS NULL OR next_retry_at <= ?", Time.current)
  }

  def pending?
    status == 'pending'
  end

  def delivered?
    status == 'delivered'
  end

  def failed?
    status == 'failed'
  end

  def can_retry?
    failed? && attempt_count < MAX_ATTEMPTS
  end

  def mark_processing!
    update!(status: 'processing')
  end

  def mark_delivered!(response_code, response_body = nil)
    update!(
      status: 'delivered',
      response_code: response_code,
      response_body: response_body&.truncate(10000),
      delivered_at: Time.current,
      attempt_count: attempt_count + 1
    )
    webhook.record_success!
  end

  def mark_failed!(response_code, response_body = nil)
    new_attempt = attempt_count + 1
    
    attrs = {
      status: 'failed',
      response_code: response_code,
      response_body: response_body&.truncate(10000),
      attempt_count: new_attempt
    }

    if new_attempt < MAX_ATTEMPTS
      delay = [30, 60, 300, 900, 3600][new_attempt - 1] || 3600
      attrs[:next_retry_at] = delay.seconds.from_now
    end

    update!(attrs)
    webhook.record_failure!("HTTP #{response_code}")
  end

  def retry!
    return unless can_retry?
    
    update!(status: 'pending', next_retry_at: nil)
  end
end
