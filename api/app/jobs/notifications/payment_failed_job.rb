module Notifications
  class PaymentFailedJob < ApplicationJob
    queue_as :notifications

    def perform(payment_id)
      payment = Payment.find_by(id: payment_id)
      return unless payment

      ActsAsTenant.with_tenant(payment.tenant) do
        send_email_notification(payment)
        create_in_app_notification(payment)
      end
    end

    private

    def send_email_notification(payment)
      return unless user_prefers_channel?(payment.user, 'payment_failed', 'email')

      service = EmailService.new
      service.send_email(
        to: payment.user.email,
        subject: 'Payment Failed',
        body: payment_failed_body(payment)
      )
    end

    def create_in_app_notification(payment)
      Notification.create!(
        tenant: payment.tenant,
        user: payment.user,
        booking: payment.booking,
        notification_type: 'payment_failed',
        channel: 'in_app',
        status: 'sent',
        subject: 'Payment Failed',
        body: "Your payment of #{payment.amount.format} could not be processed. Please try again or use a different payment method.",
        sent_at: Time.current
      )
    end

    def payment_failed_body(payment)
      <<~HTML
        <h2>Payment Failed</h2>
        <p>We were unable to process your payment of #{payment.amount.format}.</p>
        <p>Please try again or use a different payment method.</p>
        <p>If you continue to experience issues, please contact support.</p>
      HTML
    end

    def user_prefers_channel?(user, notification_type, channel)
      NotificationPreference.user_prefers?(user, notification_type, channel)
    end
  end
end
