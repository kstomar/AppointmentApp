module Notifications
  class BookingReminderJob < ApplicationJob
    queue_as :notifications

    def perform(booking_id)
      booking = Booking.find_by(id: booking_id)
      return unless booking
      return unless booking.confirmed?
      return if booking.start_at < Time.current

      ActsAsTenant.with_tenant(booking.tenant) do
        send_email_notification(booking)
        send_sms_notification(booking)
        create_in_app_notification(booking)
      end
    end

    private

    def send_email_notification(booking)
      return unless user_prefers_channel?(booking.client, 'booking_reminder', 'email')

      service = EmailService.new
      result = service.send_booking_reminder(booking)

      create_notification_record(booking, 'email', result)
    end

    def send_sms_notification(booking)
      return unless booking.client.phone.present?
      return unless user_prefers_channel?(booking.client, 'booking_reminder', 'sms')

      service = SmsService.new
      result = service.send_booking_reminder(booking)

      create_notification_record(booking, 'sms', result)
    end

    def create_in_app_notification(booking)
      Notification.create!(
        tenant: booking.tenant,
        user: booking.client,
        booking: booking,
        notification_type: 'booking_reminder',
        channel: 'in_app',
        status: 'sent',
        subject: 'Appointment Reminder',
        body: "Reminder: Your appointment for #{booking.service.name} is coming up on #{booking.start_at.strftime('%B %d at %I:%M %p')}.",
        sent_at: Time.current
      )
    end

    def user_prefers_channel?(user, notification_type, channel)
      NotificationPreference.user_prefers?(user, notification_type, channel)
    end

    def create_notification_record(booking, channel, result)
      Notification.create!(
        tenant: booking.tenant,
        user: booking.client,
        booking: booking,
        notification_type: 'booking_reminder',
        channel: channel,
        status: result.success? ? 'sent' : 'failed',
        subject: 'Appointment Reminder',
        body: "Reminder for booking #{booking.confirmation_code}",
        provider_message_id: result.result&.dig(:message_id) || result.result&.dig(:message_sid),
        sent_at: result.success? ? Time.current : nil,
        failure_reason: result.errors_list.first&.dig(:message)
      )
    end
  end
end
