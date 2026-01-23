module Bookings
  class CancelBookingService < BaseService
    def initialize(booking:, cancelled_by:, reason: nil, notify_waitlist: true)
      super()
      @booking = booking
      @cancelled_by = cancelled_by
      @reason = reason
      @notify_waitlist = notify_waitlist
    end

    def call
      validate_inputs
      return self if failure?

      ActiveRecord::Base.transaction do
        cancel_booking
        process_refund if eligible_for_refund?
        remove_from_calendar
        notify_waitlist_entries if @notify_waitlist
        send_notifications
      end

      set_result(@booking)
      self
    rescue ActiveRecord::RecordInvalid => e
      add_error(e.message)
      self
    end

    private

    def validate_inputs
      add_error('Booking is required') unless @booking
      add_error('Cancelled by user is required') unless @cancelled_by
      add_error('Booking cannot be cancelled') unless @booking&.can_cancel?
    end

    def cancel_booking
      @booking.cancel!(@cancelled_by, @reason)
    end

    def eligible_for_refund?
      return false unless @booking.paid_amount_cents&.positive?
      
      @booking.within_cancellation_window?
    end

    def process_refund
      return unless @booking.payments.completed.exists?

      refund_amount = calculate_refund_amount
      return if refund_amount <= 0

      @booking.payments.completed.each do |payment|
        next unless payment.refundable?
        
        amount_to_refund = [refund_amount, payment.refundable_amount].min
        payment.process_refund!(amount_to_refund, reason: "Booking cancelled: #{@reason}", processed_by: @cancelled_by)
        refund_amount -= amount_to_refund
        break if refund_amount <= 0
      end

      @booking.update!(payment_status: 'refunded')
    end

    def calculate_refund_amount
      if @booking.within_cancellation_window?
        @booking.paid_amount_cents
      else
        (@booking.paid_amount_cents - (@booking.deposit_amount_cents || 0)).clamp(0, Float::INFINITY)
      end
    end

    def remove_from_calendar
      Calendars::RemoveBookingJob.perform_later(@booking.id)
    end

    def notify_waitlist_entries
      WaitlistNotificationJob.perform_later(
        service_id: @booking.service_id,
        staff_member_id: @booking.staff_member_id,
        date: @booking.start_at.to_date.to_s,
        time: @booking.start_at.strftime('%H:%M')
      )
    end

    def send_notifications
      Notifications::BookingCancelledJob.perform_later(@booking.id)
    end
  end
end
