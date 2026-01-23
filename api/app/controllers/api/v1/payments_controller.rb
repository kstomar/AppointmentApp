module Api
  module V1
    class PaymentsController < BaseController
      before_action :set_booking, only: [:create_intent, :create_checkout]
      before_action :set_payment, only: [:show, :refund]

      def index
        @payments = policy_scope(Payment).includes(:booking, :user, :business)
        @payments = @payments.where(business_id: params[:business_id]) if params[:business_id].present?
        @payments = @payments.where(booking_id: params[:booking_id]) if params[:booking_id].present?
        @payments = @payments.where(status: params[:status]) if params[:status].present?
        @payments = @payments.order(created_at: :desc).page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@payments)
      end

      def show
        authorize @payment
        render_success(payment_response(@payment))
      end

      def create_intent
        authorize @booking, :pay?

        provider = params[:provider] || 'stripe'
        amount = params[:amount_cents] || @booking.balance_due

        case provider
        when 'stripe'
          service = Payments::StripeService.new(business: @booking.business)
          result = service.create_payment_intent(
            booking: @booking,
            amount_cents: amount,
            currency: @booking.business.currency
          )
        when 'razorpay'
          service = Payments::RazorpayService.new(business: @booking.business)
          result = service.create_order(
            booking: @booking,
            amount_cents: amount,
            currency: @booking.business.currency
          )
        else
          return render_error('Invalid payment provider')
        end

        if result.success?
          render_success(result.result)
        else
          render_error('Payment initialization failed', errors: result.errors.full_messages)
        end
      end

      def create_checkout
        authorize @booking, :pay?

        service = Payments::StripeService.new(business: @booking.business)
        result = service.create_checkout_session(
          booking: @booking,
          success_url: params[:success_url],
          cancel_url: params[:cancel_url]
        )

        if result.success?
          render_success(result.result)
        else
          render_error('Checkout creation failed', errors: result.errors.full_messages)
        end
      end

      def confirm
        provider = params[:provider] || 'stripe'

        case provider
        when 'stripe'
          service = Payments::StripeService.new(business: current_tenant.businesses.first)
          result = service.confirm_payment(payment_intent_id: params[:payment_intent_id])
        when 'razorpay'
          service = Payments::RazorpayService.new(business: current_tenant.businesses.first)
          result = service.verify_payment(
            razorpay_order_id: params[:razorpay_order_id],
            razorpay_payment_id: params[:razorpay_payment_id],
            razorpay_signature: params[:razorpay_signature]
          )
        else
          return render_error('Invalid payment provider')
        end

        if result.success?
          log_audit(action: 'create', auditable: result.result)
          render_success(payment_response(result.result), message: 'Payment confirmed')
        else
          render_error('Payment confirmation failed', errors: result.errors.full_messages)
        end
      end

      def refund
        authorize @payment

        service = case @payment.provider
                  when 'stripe'
                    Payments::StripeService.new(business: @payment.business)
                  when 'razorpay'
                    Payments::RazorpayService.new(business: @payment.business)
                  end

        result = service.process_refund(
          payment: @payment,
          amount_cents: params[:amount_cents],
          reason: params[:reason]
        )

        if result.success?
          log_audit(action: 'update', auditable: @payment, changes: { refunded: true })
          render_success(payment_response(@payment.reload), message: 'Refund processed')
        else
          render_error('Refund failed', errors: result.errors.full_messages)
        end
      end

      private

      def set_booking
        @booking = Booking.find(params[:booking_id])
      end

      def set_payment
        @payment = Payment.find(params[:id])
      end

      def payment_response(payment)
        {
          id: payment.id,
          booking_id: payment.booking_id,
          payment_type: payment.payment_type,
          status: payment.status,
          provider: payment.provider,
          amount: payment.amount.format,
          amount_cents: payment.amount_cents,
          refunded_amount: payment.refunded_amount&.format,
          refunded_amount_cents: payment.refunded_amount_cents,
          currency: payment.currency,
          payment_method: payment.payment_method,
          card_last_four: payment.card_last_four,
          card_brand: payment.card_brand,
          paid_at: payment.paid_at,
          created_at: payment.created_at
        }
      end
    end
  end
end
