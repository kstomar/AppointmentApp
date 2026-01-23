module Payments
  class StripeService < BaseService
    def initialize(business:)
      super()
      @business = business
      configure_stripe
    end

    def create_payment_intent(booking:, amount_cents:, currency: 'usd', metadata: {})
      begin
        customer = find_or_create_customer(booking.client)

        intent = Stripe::PaymentIntent.create(
          amount: amount_cents,
          currency: currency.downcase,
          customer: customer.id,
          metadata: {
            booking_id: booking.id,
            business_id: @business.id,
            tenant_id: current_tenant&.id
          }.merge(metadata),
          receipt_email: booking.client.email,
          description: "Booking #{booking.confirmation_code} - #{booking.service.name}"
        )

        payment = Payment.create!(
          tenant: current_tenant,
          booking: booking,
          user: booking.client,
          business: @business,
          payment_type: determine_payment_type(booking, amount_cents),
          status: 'pending',
          provider: 'stripe',
          provider_payment_id: intent.id,
          provider_customer_id: customer.id,
          amount_cents: amount_cents,
          amount_currency: currency.upcase,
          currency: currency.upcase
        )

        set_result({
          client_secret: intent.client_secret,
          payment_intent_id: intent.id,
          payment_id: payment.id
        })
      rescue Stripe::StripeError => e
        add_error("Stripe error: #{e.message}")
      end

      self
    end

    def confirm_payment(payment_intent_id:)
      begin
        intent = Stripe::PaymentIntent.retrieve(payment_intent_id)
        payment = Payment.find_by(provider_payment_id: payment_intent_id)

        unless payment
          add_error('Payment not found')
          return self
        end

        case intent.status
        when 'succeeded'
          payment.mark_completed!
          update_booking_payment_status(payment)
          set_result(payment)
        when 'requires_payment_method', 'requires_confirmation'
          add_error('Payment requires additional action')
        when 'canceled'
          payment.update!(status: 'cancelled')
          add_error('Payment was cancelled')
        else
          add_error("Unexpected payment status: #{intent.status}")
        end
      rescue Stripe::StripeError => e
        add_error("Stripe error: #{e.message}")
      end

      self
    end

    def process_refund(payment:, amount_cents: nil, reason: nil)
      return add_error('Payment not refundable') unless payment.refundable?

      amount = amount_cents || payment.refundable_amount
      return add_error('Invalid refund amount') if amount <= 0 || amount > payment.refundable_amount

      begin
        refund = Stripe::Refund.create(
          payment_intent: payment.provider_payment_id,
          amount: amount,
          reason: map_refund_reason(reason),
          metadata: {
            payment_id: payment.id,
            booking_id: payment.booking_id
          }
        )

        db_refund = payment.process_refund!(
          amount,
          reason: reason,
          processed_by: nil
        )

        db_refund.complete!(refund.id, refund.to_h)
        update_booking_payment_status(payment)

        set_result(db_refund)
      rescue Stripe::StripeError => e
        add_error("Refund failed: #{e.message}")
      end

      self
    end

    def create_checkout_session(booking:, success_url:, cancel_url:)
      begin
        customer = find_or_create_customer(booking.client)

        session = Stripe::Checkout::Session.create(
          customer: customer.id,
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: @business.currency.downcase,
              product_data: {
                name: booking.service.name,
                description: "Appointment on #{booking.start_at.strftime('%B %d, %Y at %I:%M %p')}"
              },
              unit_amount: booking.total_amount_cents
            },
            quantity: 1
          }],
          mode: 'payment',
          success_url: success_url,
          cancel_url: cancel_url,
          metadata: {
            booking_id: booking.id,
            business_id: @business.id
          }
        )

        set_result({
          session_id: session.id,
          url: session.url
        })
      rescue Stripe::StripeError => e
        add_error("Stripe error: #{e.message}")
      end

      self
    end

    def handle_webhook(payload:, signature:)
      begin
        event = Stripe::Webhook.construct_event(
          payload,
          signature,
          ENV['STRIPE_WEBHOOK_SECRET']
        )

        case event.type
        when 'payment_intent.succeeded'
          handle_payment_succeeded(event.data.object)
        when 'payment_intent.payment_failed'
          handle_payment_failed(event.data.object)
        when 'charge.refunded'
          handle_charge_refunded(event.data.object)
        end

        set_result(event.type)
      rescue JSON::ParserError
        add_error('Invalid payload')
      rescue Stripe::SignatureVerificationError
        add_error('Invalid signature')
      end

      self
    end

    private

    def configure_stripe
      Stripe.api_key = ENV['STRIPE_SECRET_KEY']
    end

    def find_or_create_customer(user)
      if user.metadata['stripe_customer_id'].present?
        begin
          return Stripe::Customer.retrieve(user.metadata['stripe_customer_id'])
        rescue Stripe::InvalidRequestError
        end
      end

      customer = Stripe::Customer.create(
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        metadata: {
          user_id: user.id,
          tenant_id: current_tenant&.id
        }
      )

      user.update!(metadata: user.metadata.merge('stripe_customer_id' => customer.id))
      customer
    end

    def determine_payment_type(booking, amount_cents)
      if booking.deposit_amount_cents && amount_cents == booking.deposit_amount_cents
        'deposit'
      elsif amount_cents == booking.total_amount_cents
        'full_payment'
      else
        'partial_payment'
      end
    end

    def update_booking_payment_status(payment)
      return unless payment.booking

      booking = payment.booking
      total_paid = booking.payments.completed.sum(:amount_cents)

      status = if total_paid >= booking.total_amount_cents
                 'paid'
               elsif total_paid > 0
                 'partially_paid'
               else
                 'unpaid'
               end

      booking.update!(
        payment_status: status,
        paid_amount_cents: total_paid
      )
    end

    def map_refund_reason(reason)
      case reason&.downcase
      when /duplicate/ then 'duplicate'
      when /fraud/ then 'fraudulent'
      else 'requested_by_customer'
      end
    end

    def handle_payment_succeeded(payment_intent)
      payment = Payment.find_by(provider_payment_id: payment_intent.id)
      return unless payment

      payment.update!(
        status: 'completed',
        paid_at: Time.current,
        card_last_four: payment_intent.charges.data.first&.payment_method_details&.card&.last4,
        card_brand: payment_intent.charges.data.first&.payment_method_details&.card&.brand,
        provider_response: payment_intent.to_h
      )

      update_booking_payment_status(payment)
      Notifications::PaymentReceivedJob.perform_later(payment.id)
    end

    def handle_payment_failed(payment_intent)
      payment = Payment.find_by(provider_payment_id: payment_intent.id)
      return unless payment

      payment.mark_failed!(payment_intent.last_payment_error&.message)
      Notifications::PaymentFailedJob.perform_later(payment.id)
    end

    def handle_charge_refunded(charge)
      payment = Payment.find_by(provider_payment_id: charge.payment_intent)
      return unless payment

      payment.update!(
        refunded_amount_cents: charge.amount_refunded,
        status: charge.refunded ? 'refunded' : payment.status
      )
    end
  end
end
