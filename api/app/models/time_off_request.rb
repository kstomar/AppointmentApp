class TimeOffRequest < ApplicationRecord
  include Tenantable

  STATUSES = %w[pending approved rejected cancelled].freeze

  belongs_to :tenant
  belongs_to :staff_member
  belongs_to :approved_by, class_name: 'User', optional: true

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :start_at, presence: true
  validates :end_at, presence: true
  validate :end_after_start
  validate :no_overlapping_requests, on: :create

  scope :pending, -> { where(status: 'pending') }
  scope :approved, -> { where(status: 'approved') }
  scope :active, -> { where(status: %w[pending approved]) }
  scope :for_date_range, ->(start_date, end_date) {
    where("start_at <= ? AND end_at >= ?", end_date, start_date)
  }

  def pending?
    status == 'pending'
  end

  def approved?
    status == 'approved'
  end

  def rejected?
    status == 'rejected'
  end

  def cancelled?
    status == 'cancelled'
  end

  def approve!(approver)
    update!(
      status: 'approved',
      approved_by: approver,
      approved_at: Time.current
    )
  end

  def reject!(approver)
    update!(
      status: 'rejected',
      approved_by: approver,
      approved_at: Time.current
    )
  end

  def cancel!
    update!(status: 'cancelled')
  end

  def duration_days
    ((end_at - start_at) / 1.day).ceil
  end

  def covers_date?(date)
    date_time = date.to_datetime
    start_at <= date_time.end_of_day && end_at >= date_time.beginning_of_day
  end

  private

  def end_after_start
    return unless start_at && end_at
    
    if end_at <= start_at
      errors.add(:end_at, 'must be after start time')
    end
  end

  def no_overlapping_requests
    return unless staff_member && start_at && end_at
    
    overlapping = staff_member.time_off_requests
                              .active
                              .for_date_range(start_at, end_at)
                              .exists?
    
    if overlapping
      errors.add(:base, 'overlaps with an existing time off request')
    end
  end
end
