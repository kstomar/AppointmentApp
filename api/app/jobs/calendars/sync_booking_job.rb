module Calendars
  class SyncBookingJob < ApplicationJob
    queue_as :calendars

    def perform(booking_id)
      booking = Booking.find_by(id: booking_id)
      return unless booking

      ActsAsTenant.with_tenant(booking.tenant) do
        sync_to_staff_calendar(booking)
      end
    end

    private

    def sync_to_staff_calendar(booking)
      return unless booking.staff_member

      booking.staff_member.calendar_integrations.active.each do |integration|
        next unless integration.can_push?

        case integration.provider
        when 'google_calendar'
          sync_to_google(integration, booking)
        when 'outlook'
          sync_to_outlook(integration, booking)
        end
      end
    end

    def sync_to_google(integration, booking)
      service = GoogleCalendarService.new(calendar_integration: integration)

      if booking.external_calendar_event_id.present?
        service.update_event(booking)
      else
        service.create_event(booking)
      end
    end

    def sync_to_outlook(integration, booking)
      # Outlook sync implementation would go here
      Rails.logger.info "Outlook sync not yet implemented for booking #{booking.id}"
    end
  end
end
