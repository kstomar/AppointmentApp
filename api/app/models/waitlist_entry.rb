class WaitlistEntry < ApplicationRecord
  include Tenantable

  STATUSES = %w[waiting notified booked expired cancelled].freeze

  belongs_to :tenant
  belongs_to :business
  belongs_to :service
  belongs_to :staff_member, optional: true
  belongs_to :client, class_name: 'User'

  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :valid_time_range

  scope :waiting, -> { where(status: 'waiting') }
  scope :active, -> { where(status: %w[waiting notified]) }
  scope :for_service, ->(service_id) { where(service_id: service_id) }
  scope :for_staff, ->(staff_member_id) { where(staff_member_id: staff_member_id) }
  scope :for_date, ->(date) { where(preferred_date: date) }
  scope :by_priority, -> { order(priority: :desc, created_at: :asc) }
  scope :not_expired, -> { where("expires_at IS NULL OR expires_at > ?", Time.current) }

  def waiting?
    status == 'waiting'
  end

  def notified?
    status == 'notified'
  end

  def booked?
    status == 'booked'
  end

  def expired?
    status == 'expired' || (expires_at.present? && expires_at < Time.current)
  end

  def notify!
    update!(status: 'notified', notified_at: Time.current)
  end

  def mark_booked!
    update!(status: 'booked')
  end

  def cancel!
    update!(status: 'cancelled')
  end

  def expire!
    update!(status: 'expired')
  end

  def matches_slot?(slot_date, slot_time, slot_staff_member_id = nil)
    return false unless waiting?
    return false if preferred_date && preferred_date != slot_date
    return false if staff_member_id && slot_staff_member_id && staff_member_id != slot_staff_member_id
    
    if preferred_time_start && preferred_time_end
      slot_time >= preferred_time_start && slot_time <= preferred_time_end
    else
      true
    end
  end

  private

  def valid_time_range
    return unless preferred_time_start && preferred_time_end
    
    if preferred_time_end <= preferred_time_start
      errors.add(:preferred_time_end, 'must be after start time')
    end
  end
end
