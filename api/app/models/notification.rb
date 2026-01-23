class Notification < ApplicationRecord
  include Tenantable

  NOTIFICATION_TYPES = %w[
    booking_confirmation booking_reminder booking_cancelled booking_rescheduled
    booking_completed payment_received payment_failed refund_processed
    waitlist_available review_request staff_assignment time_off_approved
    time_off_rejected system_alert
  ].freeze
  CHANNELS = %w[email sms push in_app].freeze
  STATUSES = %w[pending scheduled sent delivered read failed].freeze

  belongs_to :tenant
  belongs_to :user
  belongs_to :booking, optional: true

  validates :notification_type, presence: true, inclusion: { in: NOTIFICATION_TYPES }
  validates :channel, presence: true, inclusion: { in: CHANNELS }
  validates :status, presence: true, inclusion: { in: STATUSES }

  scope :pending, -> { where(status: 'pending') }
  scope :scheduled, -> { where(status: 'scheduled') }
  scope :sent, -> { where(status: 'sent') }
  scope :failed, -> { where(status: 'failed') }
  scope :unread, -> { where(read_at: nil) }
  scope :by_channel, ->(channel) { where(channel: channel) }
  scope :due_for_sending, -> { 
    where(status: %w[pending scheduled])
      .where("scheduled_for IS NULL OR scheduled_for <= ?", Time.current)
  }

  def pending?
    status == 'pending'
  end

  def sent?
    status == 'sent'
  end

  def delivered?
    status == 'delivered'
  end

  def failed?
    status == 'failed'
  end

  def read?
    read_at.present?
  end

  def mark_sent!(provider_message_id = nil, response = {})
    update!(
      status: 'sent',
      sent_at: Time.current,
      provider_message_id: provider_message_id,
      provider_response: response
    )
  end

  def mark_delivered!
    update!(status: 'delivered', delivered_at: Time.current)
  end

  def mark_read!
    update!(read_at: Time.current) unless read?
  end

  def mark_failed!(reason, response = {})
    update!(
      status: 'failed',
      failed_at: Time.current,
      failure_reason: reason,
      provider_response: response,
      retry_count: retry_count + 1
    )
  end

  def can_retry?
    failed? && retry_count < 3
  end

  def schedule_retry!
    return unless can_retry?
    
    delay = [5, 15, 60][retry_count] || 60
    update!(status: 'scheduled', scheduled_for: delay.minutes.from_now)
  end
end
