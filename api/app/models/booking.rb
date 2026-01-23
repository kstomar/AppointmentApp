class Booking < ApplicationRecord
  include Tenantable
  include Discardable
  include Auditable

  STATUSES = %w[pending confirmed in_progress completed cancelled no_show rescheduled].freeze
  PAYMENT_STATUSES = %w[unpaid partially_paid paid refunded].freeze
  BOOKING_TYPES = %w[single recurring group].freeze
  SOURCES = %w[web mobile admin api widget].freeze

  monetize :total_amount_cents, allow_nil: true
  monetize :deposit_amount_cents, allow_nil: true
  monetize :paid_amount_cents, allow_nil: true

  belongs_to :tenant
  belongs_to :business
  belongs_to :location, optional: true
  belongs_to :service
  belongs_to :staff_member, optional: true
  belongs_to :client, class_name: 'User', inverse_of: :bookings
  belongs_to :booked_by, class_name: 'User', optional: true, inverse_of: :booked_appointments
  belongs_to :cancelled_by, class_name: 'User', optional: true
  belongs_to :parent_booking, class_name: 'Booking', optional: true, inverse_of: :child_bookings
  has_many :child_bookings, class_name: 'Booking', foreign_key: :parent_booking_id, dependent: :nullify, inverse_of: :parent_booking
  has_many :booking_attendees, dependent: :destroy
  has_many :payments, dependent: :nullify
  has_many :notifications, dependent: :destroy
  has_many :calendar_events, dependent: :nullify
  has_one :invoice, dependent: :nullify
  has_one :intake_form_response, dependent: :destroy

  validates :confirmation_code, presence: true, uniqueness: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :payment_status, presence: true, inclusion: { in: PAYMENT_STATUSES }
  validates :booking_type, presence: true, inclusion: { in: BOOKING_TYPES }
  validates :source, presence: true, inclusion: { in: SOURCES }
  validates :start_at, presence: true
  validates :end_at, presence: true
  validates :duration_minutes, presence: true, numericality: { greater_than: 0 }
  validates :attendee_count, numericality: { greater_than: 0 }
  validate :end_after_start
  validate :no_double_booking, on: :create

  before_validation :generate_confirmation_code, on: :create
  before_validation :calculate_end_time, on: :create

  scope :upcoming, -> { where("start_at > ?", Time.current).order(start_at: :asc) }
  scope :past, -> { where("end_at < ?", Time.current).order(start_at: :desc) }
  scope :today, -> { where(start_at: Time.current.beginning_of_day..Time.current.end_of_day) }
  scope :for_date, ->(date) { where(start_at: date.beginning_of_day..date.end_of_day) }
  scope :for_date_range, ->(start_date, end_date) { where(start_at: start_date..end_date) }
  scope :confirmed, -> { where(status: 'confirmed') }
  scope :pending, -> { where(status: 'pending') }
  scope :active, -> { where(status: %w[pending confirmed in_progress]) }
  scope :completed, -> { where(status: 'completed') }
  scope :cancelled, -> { where(status: 'cancelled') }
  scope :no_shows, -> { where(status: 'no_show') }
  scope :needs_reminder, -> {
    where(reminder_sent_at: nil)
      .where(status: %w[pending confirmed])
      .where("start_at > ? AND start_at < ?", Time.current, 24.hours.from_now)
  }

  def pending?
    status == 'pending'
  end

  def confirmed?
    status == 'confirmed'
  end

  def completed?
    status == 'completed'
  end

  def cancelled?
    status == 'cancelled'
  end

  def no_show?
    status == 'no_show'
  end

  def active?
    %w[pending confirmed in_progress].include?(status)
  end

  def can_cancel?
    active? && start_at > Time.current
  end

  def can_reschedule?
    active? && start_at > Time.current
  end

  def within_cancellation_window?
    return true unless business.cancellation_policy_hours.positive?
    
    start_at > business.cancellation_policy_hours.hours.from_now
  end

  def confirm!
    update!(status: 'confirmed', confirmed_at: Time.current)
  end

  def complete!
    update!(status: 'completed', completed_at: Time.current)
  end

  def cancel!(user, reason = nil)
    update!(
      status: 'cancelled',
      cancelled_at: Time.current,
      cancelled_by: user,
      cancellation_reason: reason
    )
  end

  def mark_no_show!
    update!(status: 'no_show', no_show_at: Time.current)
  end

  def start_in_progress!
    update!(status: 'in_progress')
  end

  def fully_paid?
    payment_status == 'paid'
  end

  def balance_due
    (total_amount_cents || 0) - (paid_amount_cents || 0)
  end

  def deposit_required?
    deposit_amount_cents.present? && deposit_amount_cents > 0
  end

  def deposit_paid?
    (paid_amount_cents || 0) >= (deposit_amount_cents || 0)
  end

  def time_until_start
    start_at - Time.current
  end

  def duration
    end_at - start_at
  end

  def overlaps_with?(other_start, other_end)
    start_at < other_end && end_at > other_start
  end

  private

  def generate_confirmation_code
    return if confirmation_code.present?
    
    loop do
      self.confirmation_code = SecureRandom.alphanumeric(8).upcase
      break unless Booking.exists?(confirmation_code: confirmation_code)
    end
  end

  def calculate_end_time
    return if end_at.present? || start_at.blank? || duration_minutes.blank?
    
    self.end_at = start_at + duration_minutes.minutes
  end

  def end_after_start
    return unless start_at && end_at
    
    if end_at <= start_at
      errors.add(:end_at, 'must be after start time')
    end
  end

  def no_double_booking
    return unless staff_member && start_at && end_at
    
    conflicting = staff_member.bookings
                              .active
                              .where.not(id: id)
                              .where("start_at < ? AND end_at > ?", end_at, start_at)
                              .exists?
    
    if conflicting
      errors.add(:base, 'conflicts with an existing booking')
    end
  end
end
