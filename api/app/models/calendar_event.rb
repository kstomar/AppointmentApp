class CalendarEvent < ApplicationRecord
  include Tenantable

  STATUSES = %w[active cancelled tentative].freeze

  belongs_to :tenant
  belongs_to :calendar_integration
  belongs_to :booking, optional: true

  validates :external_event_id, presence: true, uniqueness: { scope: :calendar_integration_id }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :start_at, presence: true
  validates :end_at, presence: true
  validate :end_after_start

  scope :active, -> { where(status: 'active') }
  scope :blocking, -> { where(is_blocking: true) }
  scope :for_date_range, ->(start_date, end_date) {
    where("start_at < ? AND end_at > ?", end_date, start_date)
  }
  scope :all_day, -> { where(is_all_day: true) }
  scope :synced_from_external, -> { where(booking_id: nil) }
  scope :linked_to_booking, -> { where.not(booking_id: nil) }

  def active?
    status == 'active'
  end

  def cancelled?
    status == 'cancelled'
  end

  def from_booking?
    booking_id.present?
  end

  def external_only?
    booking_id.nil?
  end

  def duration_minutes
    ((end_at - start_at) / 60).to_i
  end

  def overlaps_with?(other_start, other_end)
    start_at < other_end && end_at > other_start
  end

  def blocks_time_slot?(slot_start, slot_end)
    return false unless is_blocking? && active?
    
    overlaps_with?(slot_start, slot_end)
  end

  def update_from_external!(event_data)
    update!(
      title: event_data[:title],
      description: event_data[:description],
      start_at: event_data[:start_at],
      end_at: event_data[:end_at],
      is_all_day: event_data[:is_all_day] || false,
      location: event_data[:location],
      attendees: event_data[:attendees] || [],
      status: event_data[:status] || 'active',
      raw_data: event_data[:raw_data] || {},
      synced_at: Time.current
    )
  end

  private

  def end_after_start
    return unless start_at && end_at
    
    if end_at <= start_at
      errors.add(:end_at, 'must be after start time')
    end
  end
end
