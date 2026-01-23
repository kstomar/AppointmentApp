module Bookings
  class AvailabilityService < BaseService
    def initialize(business:, service:, staff_member: nil, location: nil, date_range:)
      super()
      @business = business
      @service = service
      @staff_member = staff_member
      @location = location
      @start_date = date_range[:start_date].to_date
      @end_date = date_range[:end_date].to_date
    end

    def call
      validate_inputs
      return self if failure?

      available_slots = []
      
      (@start_date..@end_date).each do |date|
        next if date < Date.current
        next unless business_open_on?(date)

        staff_members_to_check.each do |staff|
          slots = generate_slots_for_staff(staff, date)
          available_slots.concat(slots)
        end
      end

      set_result(available_slots.sort_by { |s| [s[:date], s[:start_time]] })
      self
    end

    private

    def validate_inputs
      add_error('Business is required') unless @business
      add_error('Service is required') unless @service
      add_error('Start date is required') unless @start_date
      add_error('End date is required') unless @end_date
      add_error('End date must be after start date') if @start_date && @end_date && @end_date < @start_date
      add_error('Date range cannot exceed 60 days') if @start_date && @end_date && (@end_date - @start_date).to_i > 60
    end

    def staff_members_to_check
      if @staff_member
        [@staff_member]
      else
        @service.staff_members.bookable.active
      end
    end

    def business_open_on?(date)
      return true unless @location
      
      @location.open_on?(date.wday)
    end

    def generate_slots_for_staff(staff, date)
      slots = []
      timezone = staff.effective_timezone
      
      working_hours = get_working_hours(staff, date)
      return slots if working_hours.empty?

      blocked_times = get_blocked_times(staff, date)
      existing_bookings = get_existing_bookings(staff, date)
      calendar_events = get_calendar_events(staff, date)

      working_hours.each do |period|
        current_time = period[:start]
        
        while current_time + @service.total_duration_minutes.minutes <= period[:end]
          slot_end = current_time + @service.duration_minutes.minutes
          
          if slot_available?(current_time, slot_end, blocked_times, existing_bookings, calendar_events)
            slots << build_slot(staff, date, current_time, slot_end, timezone)
          end

          current_time += slot_interval.minutes
        end
      end

      slots
    end

    def get_working_hours(staff, date)
      rules = staff.availability_rules
                   .weekly
                   .available
                   .for_day(date.wday)
                   .active_on(date)
                   .order(priority: :desc)

      override = staff.availability_rules
                      .overrides
                      .for_date(date)
                      .order(priority: :desc)
                      .first

      if override
        return [] unless override.is_available?
        return [{ start: override.start_time, end: override.end_time }]
      end

      rules.map { |r| { start: r.start_time, end: r.end_time } }
    end

    def get_blocked_times(staff, date)
      blocked = []

      staff.availability_rules
           .blocked
           .for_date(date)
           .each do |rule|
        blocked << { start: rule.start_time, end: rule.end_time }
      end

      staff.availability_rules
           .breaks
           .for_day(date.wday)
           .active_on(date)
           .each do |rule|
        blocked << { start: rule.start_time, end: rule.end_time }
      end

      staff.time_off_requests
           .approved
           .for_date_range(date.beginning_of_day, date.end_of_day)
           .each do |request|
        if request.is_all_day?
          blocked << { start: Time.parse('00:00'), end: Time.parse('23:59') }
        else
          blocked << { 
            start: request.start_at.strftime('%H:%M'), 
            end: request.end_at.strftime('%H:%M') 
          }
        end
      end

      blocked
    end

    def get_existing_bookings(staff, date)
      staff.bookings
           .active
           .for_date(date)
           .pluck(:start_at, :end_at)
           .map { |s, e| { start: s, end: e } }
    end

    def get_calendar_events(staff, date)
      events = []
      
      staff.calendar_integrations.active.each do |integration|
        next unless integration.block_external_events?
        
        integration.calendar_events
                   .active
                   .blocking
                   .for_date_range(date.beginning_of_day, date.end_of_day)
                   .each do |event|
          events << { start: event.start_at, end: event.end_at }
        end
      end

      events
    end

    def slot_available?(start_time, end_time, blocked_times, bookings, calendar_events)
      buffer_start = start_time - @service.buffer_before_minutes.minutes
      buffer_end = end_time + @service.buffer_after_minutes.minutes

      blocked_times.none? { |b| times_overlap?(start_time, end_time, b[:start], b[:end]) }
      bookings.none? { |b| times_overlap?(buffer_start, buffer_end, b[:start], b[:end]) }
      calendar_events.none? { |e| times_overlap?(buffer_start, buffer_end, e[:start], e[:end]) }
    end

    def times_overlap?(start1, end1, start2, end2)
      start1 < end2 && end1 > start2
    end

    def slot_interval
      @business.booking_setting('slot_interval') || 15
    end

    def build_slot(staff, date, start_time, end_time, timezone)
      {
        date: date.to_s,
        start_time: start_time.strftime('%H:%M'),
        end_time: end_time.strftime('%H:%M'),
        staff_member_id: staff.id,
        staff_member_name: staff.display_name,
        service_id: @service.id,
        duration_minutes: @service.duration_minutes,
        timezone: timezone,
        available: true
      }
    end
  end
end
