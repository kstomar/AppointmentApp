class CalendarSyncJob < ApplicationJob
  queue_as :calendars

  def perform(calendar_integration_id = nil)
    if calendar_integration_id
      sync_single_integration(calendar_integration_id)
    else
      sync_all_integrations
    end
  end

  private

  def sync_single_integration(integration_id)
    integration = CalendarIntegration.find_by(id: integration_id)
    return unless integration&.active?

    ActsAsTenant.with_tenant(integration.tenant) do
      perform_sync(integration)
    end
  end

  def sync_all_integrations
    CalendarIntegration.needs_sync.find_each do |integration|
      ActsAsTenant.with_tenant(integration.tenant) do
        perform_sync(integration)
      end
    end
  end

  def perform_sync(integration)
    case integration.provider
    when 'google_calendar'
      sync_google_calendar(integration)
    when 'outlook'
      sync_outlook_calendar(integration)
    when 'ical'
      sync_ical_calendar(integration)
    end
  rescue StandardError => e
    integration.mark_sync_error!(e.message)
    Rails.logger.error "Calendar sync failed for integration #{integration.id}: #{e.message}"
  end

  def sync_google_calendar(integration)
    service = Calendars::GoogleCalendarService.new(calendar_integration: integration)
    service.sync_events
  end

  def sync_outlook_calendar(integration)
    Rails.logger.info "Outlook sync not yet implemented for integration #{integration.id}"
  end

  def sync_ical_calendar(integration)
    Rails.logger.info "iCal sync not yet implemented for integration #{integration.id}"
  end
end
