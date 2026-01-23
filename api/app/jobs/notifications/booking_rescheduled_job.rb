module Notifications
  class BookingRescheduledJob < ApplicationJob
    queue_as :notifications

    def perform(booking_id)
      booking = Booking.find_by(id: booking_id)
      return unless booking

      ActsAsTenant.with_tenant(booking.tenant) do
        send_email_notification(booking)
        send_sms_notification(booking)
        create_in_app_notification(booking)
        notify_staff(booking)
      end
    end

    private

    def send_email_notification(booking)
      return unless user_prefers_channel?(booking.client, 'booking_rescheduled', 'email')

      service = EmailService.new
      result = service.send_booking_rescheduled(booking)

      create_notification_record(booking, booking.client, 'email', result)
    end

    def send_sms_notification(booking)
      return unless booking.client.phone.present?
      return unless user_prefers_channel?(booking.client, 'booking_rescheduled', 'sms')

      service = SmsService.new
      result = service.send_booking_rescheduled(booking)

      create_notification_record(booking, booking.client, 'sms', result)
    end

    def create_in_app_notification(booking)
      Notification.create!(
        tenant: booking.tenant,
        user: booking.client,
        booking: booking,
        notification_type: 'booking_rescheduled',
        channel: 'in_app',
        status: 'sent',
        subject: 'Booking Rescheduled',
        body: "Your booking for #{booking.service.name} has been rescheduled to #{booking.start_at.strftime('%B %d at %I:%M %p')}.",
        sent_at: Time.current
      )
    end

    def notify_staff(booking)
      return unless booking.staff_member&.user

      Notification.create!(
        tenant: booking.tenant,
        user: booking.staff_member.user,
        booking: booking,
        notification_type: 'booking_rescheduled',
        channel: 'in_app',
        status: 'sent',
        subject: 'Booking Rescheduled',
        body: "Booking with #{booking.client.full_name} for #{booking.service.name} has been rescheduled to #{booking.start_at.strftime('%B %d at %I:%M %p')}.",
        sent_at: Time.current
      )
    end

    def user_prefers_channel?(user, notification_type, channel)
      NotificationPreference.user_prefers?(user, notification_type, channel)
    end

    def create_notification_record(booking, user, channel, result)
      Notification.create!(
        tenant: booking.tenant,
        user: user,
        booking: booking,
        notification_type: 'booking_rescheduled',
        channel: channel,
        status: result.success? ? 'sent' : 'failed',
        subject: 'Booking Rescheduled',
        body: "Reschedule notice for booking #{booking.confirmation_code}",
        provider_message_id: result.result&.dig(:message_id) || result.result&.dig(:message_sid),
        sent_at: result.success? ? Time.current : nil,
        failure_reason: result.errors_list.first&.dig(:message)
      )
    end
  end
end
