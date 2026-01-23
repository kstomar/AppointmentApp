class BookingAttendee < ApplicationRecord
  STATUSES = %w[confirmed pending cancelled no_show].freeze

  belongs_to :booking
  belongs_to :user, optional: true

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :email, uniqueness: { scope: :booking_id, message: 'is already added to this booking' }

  before_validation :copy_user_details, if: :user

  scope :confirmed, -> { where(status: 'confirmed') }
  scope :primary, -> { where(is_primary: true) }

  def confirmed?
    status == 'confirmed'
  end

  def display_name
    name.presence || email
  end

  private

  def copy_user_details
    self.name ||= user.full_name
    self.email ||= user.email
    self.phone ||= user.phone
  end
end
