module Bookings
  class CreateBookingService < BaseService
    def initialize(business:, service:, client:, start_at:, staff_member: nil, location: nil, 
                   booked_by: nil, notes: nil, attendees: [], intake_responses: {}, source: 'web')
      super()
      @business = business
      @service = service
      @client = client
      @staff_member = staff_member
      @location = location
      @start_at = start_at.is_a?(String) ? Time.zone.parse(start_at) : start_at
      @booked_by = booked_by
      @notes = notes
      @attendees = attendees
      @intake_responses = intake_responses
      @source = source
    end

    def call
      validate_inputs
      return self if failure?

      validate_availability
      return self if failure?

      ActiveRecord::Base.transaction do
        create_booking
        add_attendees
        process_intake_form
        calculate_pricing
        sync_to_calendar
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
      add_error('Business is required') unless @business
      add_error('Service is required') unless @service
      add_error('Client is required') unless @client
      add_error('Start time is required') unless @start_at
      add_error('Start time must be in the future') if @start_at && @start_at <= Time.current
      add_error('Service is not available for online booking') if @service && !@service.allow_online_booking?
      
      if @business && @start_at
        lead_time = @business.booking_lead_time_minutes.minutes
        if @start_at < Time.current + lead_time
          add_error("Bookings must be made at least #{@business.booking_lead_time_minutes} minutes in advance")
        end

        max_date = Date.current + @business.booking_window_days.days
        if @start_at.to_date > max_date
          add_error("Bookings cannot be made more than #{@business.booking_window_days} days in advance")
        end
      end

      if @service && @attendees.length > @service.max_attendees
        add_error("Maximum #{@service.max_attendees} attendees allowed")
      end
    end

    def validate_availability
      @staff_member ||= assign_staff_member
      
      unless @staff_member
        add_error('No available staff member for this time slot')
        return
      end

      end_at = @start_at + @service.total_duration_minutes.minutes
      
      if @staff_member.at_daily_limit?(@start_at.to_date)
        add_error('Staff member has reached their daily booking limit')
        return
      end

      conflicting = @staff_member.bookings
                                 .active
                                 .where("start_at < ? AND end_at > ?", end_at, @start_at)
                                 .exists?

      if conflicting
        add_error('This time slot is no longer available')
      end
    end

    def assign_staff_member
      available_staff = @service.staff_members.bookable.active

      if @location
        available_staff = available_staff.where(location_id: @location.id)
      end

      available_staff.find do |staff|
        !staff.at_daily_limit?(@start_at.to_date) &&
          slot_available_for_staff?(staff)
      end
    end

    def slot_available_for_staff?(staff)
      end_at = @start_at + @service.total_duration_minutes.minutes
      
      !staff.bookings
            .active
            .where("start_at < ? AND end_at > ?", end_at, @start_at)
            .exists?
    end

    def create_booking
      @booking = Booking.create!(
        tenant: current_tenant,
        business: @business,
        service: @service,
        staff_member: @staff_member,
        location: @location || @staff_member&.location || @business.primary_location,
        client: @client,
        booked_by: @booked_by || @client,
        start_at: @start_at,
        end_at: @start_at + @service.duration_minutes.minutes,
        duration_minutes: @service.duration_minutes,
        status: determine_initial_status,
        client_notes: @notes,
        source: @source,
        attendee_count: [@attendees.length, 1].max
      )
    end

    def determine_initial_status
      if @business.auto_confirm_bookings? && !@service.requires_confirmation?
        'confirmed'
      else
        'pending'
      end
    end

    def add_attendees
      return if @attendees.empty?

      @attendees.each_with_index do |attendee, index|
        @booking.booking_attendees.create!(
          user_id: attendee[:user_id],
          name: attendee[:name],
          email: attendee[:email],
          phone: attendee[:phone],
          is_primary: index == 0,
          status: 'confirmed'
        )
      end
    end

    def process_intake_form
      return if @intake_responses.blank?

      intake_form = @service.intake_forms.active.first || @business.intake_forms.general.active.first
      return unless intake_form

      IntakeFormResponse.create!(
        tenant: current_tenant,
        intake_form: intake_form,
        booking: @booking,
        client: @client,
        responses: @intake_responses,
        status: 'submitted',
        submitted_at: Time.current
      )
    end

    def calculate_pricing
      staff_service = @staff_member&.staff_services&.find_by(service: @service)
      price = staff_service&.effective_price || @service.price
      deposit = @service.deposit_amount

      @booking.update!(
        total_amount_cents: price&.cents,
        total_amount_currency: price&.currency&.iso_code || @business.currency,
        deposit_amount_cents: deposit&.cents,
        deposit_amount_currency: deposit&.currency&.iso_code || @business.currency,
        paid_amount_cents: 0
      )
    end

    def sync_to_calendar
      return unless @booking.confirmed?

      Calendars::SyncBookingJob.perform_later(@booking.id)
    end

    def send_notifications
      Notifications::BookingConfirmationJob.perform_later(@booking.id)
    end
  end
end
