module Api
  module V1
    class WebhooksController < BaseController
      skip_before_action :authenticate_user_from_jwt!
      skip_before_action :set_tenant

      def stripe
        payload = request.body.read
        signature = request.headers['Stripe-Signature']

        service = Payments::StripeService.new(business: nil)
        result = service.handle_webhook(payload: payload, signature: signature)

        if result.success?
          render_success(message: 'Webhook processed')
        else
          render_error(result.errors.full_messages.first, status: :bad_request)
        end
      end

      def razorpay
        payload = request.body.read
        signature = request.headers['X-Razorpay-Signature']

        service = Payments::RazorpayService.new(business: nil)
        result = service.handle_webhook(payload: payload, signature: signature)

        if result.success?
          render_success(message: 'Webhook processed')
        else
          render_error(result.errors.full_messages.first, status: :bad_request)
        end
      end

      def google_calendar
        channel_id = request.headers['X-Goog-Channel-ID']
        resource_state = request.headers['X-Goog-Resource-State']

        return head :ok if resource_state == 'sync'

        integration = CalendarIntegration.find_by(webhook_channel_id: channel_id)
        
        if integration
          CalendarSyncJob.perform_later(integration.id)
        end

        head :ok
      end

      private

      def skip_authorization?
        true
      end
    end
  end
end
