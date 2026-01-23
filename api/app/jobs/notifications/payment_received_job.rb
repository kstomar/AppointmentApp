module Notifications
  class PaymentReceivedJob < ApplicationJob
    queue_as :notifications

    def perform(payment_id)
      payment = Payment.find_by(id: payment_id)
      return unless payment

      ActsAsTenant.with_tenant(payment.tenant) do
        send_email_receipt(payment)
        create_in_app_notification(payment)
      end
    end

    private

    def send_email_receipt(payment)
      return unless user_prefers_channel?(payment.user, 'payment_received', 'email')

      service = EmailService.new
      service.send_payment_receipt(payment)
    end

    def create_in_app_notification(payment)
      Notification.create!(
        tenant: payment.tenant,
        user: payment.user,
        booking: payment.booking,
        notification_type: 'payment_received',
        channel: 'in_app',
        status: 'sent',
        subject: 'Payment Received',
        body: "Your payment of #{payment.amount.format} has been received. Thank you!",
        sent_at: Time.current
      )
    end

    def user_prefers_channel?(user, notification_type, channel)
      NotificationPreference.user_prefers?(user, notification_type, channel)
    end
  end
end
