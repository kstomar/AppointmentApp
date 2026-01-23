module Bookings
  class RescheduleBookingService < BaseService
    def initialize(booking:, new_start_at:, staff_member: nil, rescheduled_by: nil, reason: nil)
      super()
      @booking = booking
      @new_start_at = new_start_at.is_a?(String) ? Time.zone.parse(new_start_at) : new_start_at
      @staff_member = staff_member || @booking.staff_member
      @rescheduled_by = rescheduled_by
      @reason = reason
    end

    def call
      validate_inputs
      return self if failure?

      validate_availability
      return self if failure?

      ActiveRecord::Base.transaction do
        update_booking
        sync_calendar_changes
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
      add_error('New start time is required') unless @new_start_at
      add_error('Booking cannot be rescheduled') unless @booking&.can_reschedule?
      add_error('New start time must be in the future') if @new_start_at && @new_start_at <= Time.current

      if @booking&.business
        lead_time = @booking.business.booking_lead_time_minutes.minutes
        if @new_start_at && @new_start_at < Time.current + lead_time
          add_error("Bookings must be rescheduled at least #{@booking.business.booking_lead_time_minutes} minutes in advance")
        end
      end
    end

    def validate_availability
      new_end_at = @new_start_at + @booking.duration_minutes.minutes

      conflicting = @staff_member.bookings
                                 .active
                                 .where.not(id: @booking.id)
                                 .where("start_at < ? AND end_at > ?", new_end_at, @new_start_at)
                                 .exists?

      if conflicting
        add_error('The new time slot is not available')
      end
    end

    def update_booking
      old_start = @booking.start_at
      old_end = @booking.end_at

      @booking.update!(
        start_at: @new_start_at,
        end_at: @new_start_at + @booking.duration_minutes.minutes,
        staff_member: @staff_member,
        status: 'confirmed',
        metadata: @booking.metadata.merge(
          'rescheduled_at' => Time.current.iso8601,
          'rescheduled_by' => @rescheduled_by&.id,
          'previous_start_at' => old_start.iso8601,
          'previous_end_at' => old_end.iso8601,
          'reschedule_reason' => @reason
        )
      )
    end

    def sync_calendar_changes
      Calendars::SyncBookingJob.perform_later(@booking.id)
    end

    def send_notifications
      Notifications::BookingRescheduledJob.perform_later(@booking.id)
    end
  end
end
