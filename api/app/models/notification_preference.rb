class NotificationPreference < ApplicationRecord
  NOTIFICATION_TYPES = %w[
    booking_confirmation booking_reminder booking_cancelled booking_rescheduled
    booking_completed payment_received waitlist_available review_request
    marketing promotional
  ].freeze

  belongs_to :user

  validates :notification_type, presence: true, 
                                inclusion: { in: NOTIFICATION_TYPES },
                                uniqueness: { scope: :user_id }

  scope :for_type, ->(type) { find_by(notification_type: type) }

  def enabled_for?(channel)
    case channel.to_s
    when 'email' then email_enabled?
    when 'sms' then sms_enabled?
    when 'push' then push_enabled?
    when 'in_app' then in_app_enabled?
    else false
    end
  end

  def self.user_prefers?(user, notification_type, channel)
    pref = user.notification_preferences.for_type(notification_type)
    return true unless pref
    
    pref.enabled_for?(channel)
  end

  def self.create_defaults_for(user)
    NOTIFICATION_TYPES.each do |type|
      user.notification_preferences.find_or_create_by!(notification_type: type) do |pref|
        pref.email_enabled = true
        pref.sms_enabled = %w[booking_confirmation booking_reminder].include?(type)
        pref.push_enabled = true
        pref.in_app_enabled = true
      end
    end
  end
end
