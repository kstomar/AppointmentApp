class AvailabilityRule < ApplicationRecord
  include Tenantable
  include Discardable

  RULE_TYPES = %w[weekly_hours date_override blocked_time break].freeze
  DAYS_OF_WEEK = (0..6).to_a.freeze

  belongs_to :tenant
  belongs_to :business
  belongs_to :staff_member, optional: true
  belongs_to :location, optional: true

  validates :rule_type, presence: true, inclusion: { in: RULE_TYPES }
  validates :day_of_week, inclusion: { in: DAYS_OF_WEEK, allow_nil: true }
  validates :start_time, presence: true, if: :requires_time_range?
  validates :end_time, presence: true, if: :requires_time_range?
  validates :specific_date, presence: true, if: :date_override?
  validate :end_time_after_start_time
  validate :valid_recurrence_dates

  scope :weekly, -> { where(rule_type: 'weekly_hours') }
  scope :overrides, -> { where(rule_type: 'date_override') }
  scope :blocked, -> { where(rule_type: 'blocked_time') }
  scope :breaks, -> { where(rule_type: 'break') }
  scope :available, -> { where(is_available: true) }
  scope :unavailable, -> { where(is_available: false) }
  scope :for_day, ->(day) { where(day_of_week: day) }
  scope :for_date, ->(date) { where(specific_date: date) }
  scope :for_staff, ->(staff_member_id) { where(staff_member_id: staff_member_id) }
  scope :for_location, ->(location_id) { where(location_id: location_id) }
  scope :active_on, ->(date) {
    where("recurrence_start_date IS NULL OR recurrence_start_date <= ?", date)
      .where("recurrence_end_date IS NULL OR recurrence_end_date >= ?", date)
  }

  def date_override?
    rule_type == 'date_override'
  end

  def weekly_hours?
    rule_type == 'weekly_hours'
  end

  def blocked_time?
    rule_type == 'blocked_time'
  end

  def break?
    rule_type == 'break'
  end

  def applies_to_date?(date)
    return specific_date == date if date_override?
    return false unless is_recurring?
    return false if recurrence_start_date && date < recurrence_start_date
    return false if recurrence_end_date && date > recurrence_end_date
    
    date.wday == day_of_week
  end

  def time_range
    return nil unless start_time && end_time
    
    { start: start_time, end: end_time }
  end

  private

  def requires_time_range?
    %w[weekly_hours date_override break].include?(rule_type)
  end

  def end_time_after_start_time
    return unless start_time && end_time
    
    if end_time <= start_time
      errors.add(:end_time, 'must be after start time')
    end
  end

  def valid_recurrence_dates
    return unless recurrence_start_date && recurrence_end_date
    
    if recurrence_end_date < recurrence_start_date
      errors.add(:recurrence_end_date, 'must be after start date')
    end
  end
end
