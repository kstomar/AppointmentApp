module Calendars
  class RemoveBookingJob < ApplicationJob
    queue_as :calendars

    def perform(booking_id)
      booking = Booking.find_by(id: booking_id)
      return unless booking
      return unless booking.external_calendar_event_id.present?

      ActsAsTenant.with_tenant(booking.tenant) do
        remove_from_staff_calendar(booking)
      end
    end

    private

    def remove_from_staff_calendar(booking)
      return unless booking.staff_member

      booking.staff_member.calendar_integrations.active.each do |integration|
        next unless integration.can_push?

        case integration.provider
        when 'google_calendar'
          remove_from_google(integration, booking)
        when 'outlook'
          remove_from_outlook(integration, booking)
        end
      end
    end

    def remove_from_google(integration, booking)
      service = GoogleCalendarService.new(calendar_integration: integration)
      service.delete_event(booking)
    end

    def remove_from_outlook(integration, booking)
      Rails.logger.info "Outlook removal not yet implemented for booking #{booking.id}"
    end
  end
end
