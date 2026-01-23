module Calendars
  class GoogleCalendarService < BaseService
    def initialize(calendar_integration:)
      super()
      @integration = calendar_integration
      @client = nil
    end

    def sync_events(start_date: Date.current, end_date: Date.current + 30.days)
      ensure_valid_token
      return self if failure?

      begin
        events = fetch_events(start_date, end_date)
        process_events(events)
        @integration.mark_synced!
        set_result(events.length)
      rescue Google::Apis::AuthorizationError => e
        add_error("Authorization failed: #{e.message}")
        @integration.deactivate!('Authorization expired')
      rescue Google::Apis::ClientError => e
        add_error("Google Calendar API error: #{e.message}")
        @integration.mark_sync_error!(e.message)
      end

      self
    end

    def create_event(booking)
      ensure_valid_token
      return self if failure?

      begin
        event = build_event_from_booking(booking)
        result = calendar_service.insert_event(@integration.calendar_id || 'primary', event)
        
        booking.update!(external_calendar_event_id: result.id)
        
        CalendarEvent.create!(
          tenant: @integration.tenant,
          calendar_integration: @integration,
          booking: booking,
          external_event_id: result.id,
          title: event.summary,
          description: event.description,
          start_at: booking.start_at,
          end_at: booking.end_at,
          status: 'active',
          synced_at: Time.current
        )

        set_result(result)
      rescue Google::Apis::ClientError => e
        add_error("Failed to create event: #{e.message}")
      end

      self
    end

    def update_event(booking)
      ensure_valid_token
      return self if failure?

      return add_error('No external event ID') unless booking.external_calendar_event_id

      begin
        event = build_event_from_booking(booking)
        result = calendar_service.update_event(
          @integration.calendar_id || 'primary',
          booking.external_calendar_event_id,
          event
        )

        calendar_event = @integration.calendar_events.find_by(booking: booking)
        calendar_event&.update!(
          title: event.summary,
          start_at: booking.start_at,
          end_at: booking.end_at,
          synced_at: Time.current
        )

        set_result(result)
      rescue Google::Apis::ClientError => e
        add_error("Failed to update event: #{e.message}")
      end

      self
    end

    def delete_event(booking)
      ensure_valid_token
      return self if failure?

      return add_error('No external event ID') unless booking.external_calendar_event_id

      begin
        calendar_service.delete_event(
          @integration.calendar_id || 'primary',
          booking.external_calendar_event_id
        )

        @integration.calendar_events.where(booking: booking).destroy_all
        booking.update!(external_calendar_event_id: nil)

        set_result(true)
      rescue Google::Apis::ClientError => e
        add_error("Failed to delete event: #{e.message}")
      end

      self
    end

    def setup_webhook
      ensure_valid_token
      return self if failure?

      begin
        channel = Google::Apis::CalendarV3::Channel.new(
          id: SecureRandom.uuid,
          type: 'web_hook',
          address: webhook_url,
          expiration: 7.days.from_now.to_i * 1000
        )

        result = calendar_service.watch_event(
          @integration.calendar_id || 'primary',
          channel
        )

        @integration.update!(
          webhook_channel_id: result.id,
          webhook_expires_at: Time.at(result.expiration / 1000)
        )

        set_result(result)
      rescue Google::Apis::ClientError => e
        add_error("Failed to setup webhook: #{e.message}")
      end

      self
    end

    private

    def ensure_valid_token
      return unless @integration.needs_token_refresh?

      refresh_token
    end

    def refresh_token
      client = Signet::OAuth2::Client.new(
        client_id: ENV['GOOGLE_CLIENT_ID'],
        client_secret: ENV['GOOGLE_CLIENT_SECRET'],
        token_credential_uri: 'https://oauth2.googleapis.com/token',
        refresh_token: @integration.refresh_token
      )

      client.fetch_access_token!

      @integration.update_tokens!(
        access_token: client.access_token,
        refresh_token: client.refresh_token || @integration.refresh_token,
        expires_at: Time.current + client.expires_in.seconds
      )
    rescue Signet::AuthorizationError => e
      add_error("Token refresh failed: #{e.message}")
      @integration.deactivate!('Token refresh failed')
    end

    def calendar_service
      @client ||= begin
        service = Google::Apis::CalendarV3::CalendarService.new
        service.authorization = google_credentials
        service
      end
    end

    def google_credentials
      Google::Auth::UserRefreshCredentials.new(
        client_id: ENV['GOOGLE_CLIENT_ID'],
        client_secret: ENV['GOOGLE_CLIENT_SECRET'],
        access_token: @integration.access_token,
        refresh_token: @integration.refresh_token,
        expires_at: @integration.token_expires_at
      )
    end

    def fetch_events(start_date, end_date)
      calendar_service.list_events(
        @integration.calendar_id || 'primary',
        time_min: start_date.beginning_of_day.iso8601,
        time_max: end_date.end_of_day.iso8601,
        single_events: true,
        order_by: 'startTime',
        max_results: 250
      ).items || []
    end

    def process_events(events)
      events.each do |event|
        next if event.status == 'cancelled'

        existing = @integration.calendar_events.find_by(external_event_id: event.id)

        if existing
          existing.update_from_external!(parse_event(event))
        else
          CalendarEvent.create!(
            tenant: @integration.tenant,
            calendar_integration: @integration,
            external_event_id: event.id,
            **parse_event(event)
          )
        end
      end

      external_ids = events.map(&:id)
      @integration.calendar_events
                  .where.not(external_event_id: external_ids)
                  .where(booking_id: nil)
                  .update_all(status: 'cancelled')
    end

    def parse_event(event)
      {
        title: event.summary,
        description: event.description,
        start_at: parse_event_time(event.start),
        end_at: parse_event_time(event.end),
        is_all_day: event.start&.date.present?,
        location: event.location,
        attendees: event.attendees&.map { |a| { email: a.email, name: a.display_name } } || [],
        status: event.status == 'cancelled' ? 'cancelled' : 'active',
        raw_data: event.to_h,
        synced_at: Time.current
      }
    end

    def parse_event_time(time_obj)
      return nil unless time_obj

      if time_obj.date_time
        time_obj.date_time.to_time
      elsif time_obj.date
        Date.parse(time_obj.date).beginning_of_day
      end
    end

    def build_event_from_booking(booking)
      Google::Apis::CalendarV3::Event.new(
        summary: "#{booking.service.name} - #{booking.client.full_name}",
        description: build_event_description(booking),
        start: Google::Apis::CalendarV3::EventDateTime.new(
          date_time: booking.start_at.iso8601,
          time_zone: booking.business.timezone
        ),
        end: Google::Apis::CalendarV3::EventDateTime.new(
          date_time: booking.end_at.iso8601,
          time_zone: booking.business.timezone
        ),
        location: booking.location&.full_address,
        attendees: [
          Google::Apis::CalendarV3::EventAttendee.new(
            email: booking.client.email,
            display_name: booking.client.full_name
          )
        ],
        reminders: Google::Apis::CalendarV3::Event::Reminders.new(
          use_default: false,
          overrides: [
            Google::Apis::CalendarV3::EventReminder.new(method: 'email', minutes: 24 * 60),
            Google::Apis::CalendarV3::EventReminder.new(method: 'popup', minutes: 60)
          ]
        )
      )
    end

    def build_event_description(booking)
      lines = [
        "Service: #{booking.service.name}",
        "Client: #{booking.client.full_name}",
        "Email: #{booking.client.email}",
        "Phone: #{booking.client.phone}",
        "Confirmation: #{booking.confirmation_code}"
      ]
      
      lines << "Notes: #{booking.client_notes}" if booking.client_notes.present?
      lines.join("\n")
    end

    def webhook_url
      "#{ENV['APP_URL']}/api/v1/webhooks/google_calendar"
    end
  end
end
