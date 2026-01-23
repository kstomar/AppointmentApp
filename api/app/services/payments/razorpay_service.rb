module Payments
  class RazorpayService < BaseService
    def initialize(business:)
      super()
      @business = business
      configure_razorpay
    end

    def create_order(booking:, amount_cents:, currency: 'INR', metadata: {})
      begin
        amount_paise = amount_cents

        order = Razorpay::Order.create(
          amount: amount_paise,
          currency: currency.upcase,
          receipt: "booking_#{booking.id}",
          notes: {
            booking_id: booking.id,
            business_id: @business.id,
            tenant_id: current_tenant&.id,
            service: booking.service.name
          }.merge(metadata)
        )

        payment = Payment.create!(
          tenant: current_tenant,
          booking: booking,
          user: booking.client,
          business: @business,
          payment_type: determine_payment_type(booking, amount_cents),
          status: 'pending',
          provider: 'razorpay',
          provider_payment_id: order.id,
          amount_cents: amount_cents,
          amount_currency: currency.upcase,
          currency: currency.upcase,
          provider_response: order.to_hash
        )

        set_result({
          order_id: order.id,
          amount: amount_paise,
          currency: currency.upcase,
          key_id: ENV['RAZORPAY_KEY_ID'],
          payment_id: payment.id,
          prefill: {
            name: booking.client.full_name,
            email: booking.client.email,
            contact: booking.client.phone
          },
          notes: {
            booking_id: booking.id
          }
        })
      rescue Razorpay::Error => e
        add_error("Razorpay error: #{e.message}")
      end

      self
    end

    def verify_payment(razorpay_order_id:, razorpay_payment_id:, razorpay_signature:)
      begin
        payment = Payment.find_by(provider_payment_id: razorpay_order_id)

        unless payment
          add_error('Payment not found')
          return self
        end

        expected_signature = OpenSSL::HMAC.hexdigest(
          'sha256',
          ENV['RAZORPAY_KEY_SECRET'],
          "#{razorpay_order_id}|#{razorpay_payment_id}"
        )

        unless ActiveSupport::SecurityUtils.secure_compare(expected_signature, razorpay_signature)
          payment.mark_failed!('Invalid signature')
          add_error('Payment verification failed')
          return self
        end

        razorpay_payment = Razorpay::Payment.fetch(razorpay_payment_id)

        if razorpay_payment.status == 'captured'
          payment.update!(
            status: 'completed',
            paid_at: Time.current,
            provider_response: razorpay_payment.to_hash,
            metadata: payment.metadata.merge(
              'razorpay_payment_id' => razorpay_payment_id,
              'razorpay_signature' => razorpay_signature
            )
          )

          update_booking_payment_status(payment)
          Notifications::PaymentReceivedJob.perform_later(payment.id)
          set_result(payment)
        else
          payment.mark_failed!("Payment status: #{razorpay_payment.status}")
          add_error("Payment not captured: #{razorpay_payment.status}")
        end
      rescue Razorpay::Error => e
        add_error("Razorpay error: #{e.message}")
      end

      self
    end

    def capture_payment(razorpay_payment_id:, amount_cents:)
      begin
        payment = Razorpay::Payment.fetch(razorpay_payment_id)
        captured = payment.capture(amount: amount_cents)

        set_result(captured.to_hash)
      rescue Razorpay::Error => e
        add_error("Capture failed: #{e.message}")
      end

      self
    end

    def process_refund(payment:, amount_cents: nil, reason: nil)
      return add_error('Payment not refundable') unless payment.refundable?

      amount = amount_cents || payment.refundable_amount
      return add_error('Invalid refund amount') if amount <= 0 || amount > payment.refundable_amount

      razorpay_payment_id = payment.metadata['razorpay_payment_id']
      return add_error('Razorpay payment ID not found') unless razorpay_payment_id

      begin
        refund = Razorpay::Payment.fetch(razorpay_payment_id).refund(
          amount: amount,
          notes: {
            reason: reason,
            payment_id: payment.id,
            booking_id: payment.booking_id
          }
        )

        db_refund = payment.process_refund!(
          amount,
          reason: reason,
          processed_by: nil
        )

        db_refund.complete!(refund.id, refund.to_hash)
        update_booking_payment_status(payment)

        set_result(db_refund)
      rescue Razorpay::Error => e
        add_error("Refund failed: #{e.message}")
      end

      self
    end

    def handle_webhook(payload:, signature:)
      begin
        expected_signature = OpenSSL::HMAC.hexdigest(
          'sha256',
          ENV['RAZORPAY_WEBHOOK_SECRET'],
          payload
        )

        unless ActiveSupport::SecurityUtils.secure_compare(expected_signature, signature)
          add_error('Invalid webhook signature')
          return self
        end

        event = JSON.parse(payload)
        event_type = event['event']

        case event_type
        when 'payment.captured'
          handle_payment_captured(event['payload']['payment']['entity'])
        when 'payment.failed'
          handle_payment_failed(event['payload']['payment']['entity'])
        when 'refund.created'
          handle_refund_created(event['payload']['refund']['entity'])
        end

        set_result(event_type)
      rescue JSON::ParserError
        add_error('Invalid payload')
      end

      self
    end

    private

    def configure_razorpay
      Razorpay.setup(ENV['RAZORPAY_KEY_ID'], ENV['RAZORPAY_KEY_SECRET'])
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

    def handle_payment_captured(payment_entity)
      order_id = payment_entity['order_id']
      payment = Payment.find_by(provider_payment_id: order_id)
      return unless payment

      payment.update!(
        status: 'completed',
        paid_at: Time.current,
        provider_response: payment_entity,
        metadata: payment.metadata.merge('razorpay_payment_id' => payment_entity['id'])
      )

      update_booking_payment_status(payment)
    end

    def handle_payment_failed(payment_entity)
      order_id = payment_entity['order_id']
      payment = Payment.find_by(provider_payment_id: order_id)
      return unless payment

      payment.mark_failed!(payment_entity['error_description'])
    end

    def handle_refund_created(refund_entity)
      payment_id = refund_entity['payment_id']
      payment = Payment.joins(:metadata).where("metadata->>'razorpay_payment_id' = ?", payment_id).first
      return unless payment

      payment.update!(
        refunded_amount_cents: (payment.refunded_amount_cents || 0) + refund_entity['amount']
      )
    end
  end
end
