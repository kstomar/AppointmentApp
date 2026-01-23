module Api
  module V1
    class CalendarIntegrationsController < BaseController
      before_action :set_integration, only: [:show, :update, :destroy, :sync]

      def index
        @integrations = policy_scope(current_user.calendar_integrations)
        render_success(@integrations.map { |i| integration_response(i) })
      end

      def show
        authorize @integration
        render_success(integration_response(@integration))
      end

      def oauth_url
        provider = params[:provider]
        
        case provider
        when 'google_calendar'
          url = google_oauth_url
        when 'outlook'
          url = outlook_oauth_url
        else
          return render_error('Invalid provider')
        end

        render_success({ url: url })
      end

      def callback
        provider = params[:provider]
        code = params[:code]

        case provider
        when 'google_calendar'
          result = process_google_callback(code)
        when 'outlook'
          result = process_outlook_callback(code)
        else
          return render_error('Invalid provider')
        end

        if result[:success]
          log_audit(action: 'create', auditable: result[:integration])
          render_success(integration_response(result[:integration]), message: 'Calendar connected successfully')
        else
          render_error(result[:error])
        end
      end

      def update
        authorize @integration

        if @integration.update(integration_params)
          log_audit(action: 'update', auditable: @integration, changes: @integration.previous_changes)
          render_success(integration_response(@integration), message: 'Integration updated')
        else
          render_validation_errors(@integration)
        end
      end

      def destroy
        authorize @integration

        @integration.destroy
        log_audit(action: 'destroy', auditable: @integration)
        render_success(message: 'Calendar disconnected')
      end

      def sync
        authorize @integration

        CalendarSyncJob.perform_later(@integration.id)
        render_success(message: 'Sync started')
      end

      private

      def set_integration
        @integration = current_user.calendar_integrations.find(params[:id])
      end

      def integration_params
        params.permit(:sync_direction, :sync_availability, :sync_bookings)
      end

      def google_oauth_url
        client = Signet::OAuth2::Client.new(
          client_id: ENV['GOOGLE_CLIENT_ID'],
          authorization_uri: 'https://accounts.google.com/o/oauth2/auth',
          scope: 'https://www.googleapis.com/auth/calendar',
          redirect_uri: "#{ENV['APP_URL']}/api/v1/calendar_integrations/callback?provider=google_calendar",
          access_type: 'offline',
          prompt: 'consent'
        )
        client.authorization_uri.to_s
      end

      def outlook_oauth_url
        params = {
          client_id: ENV['OUTLOOK_CLIENT_ID'],
          response_type: 'code',
          redirect_uri: "#{ENV['APP_URL']}/api/v1/calendar_integrations/callback?provider=outlook",
          scope: 'Calendars.ReadWrite offline_access',
          response_mode: 'query'
        }
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?#{params.to_query}"
      end

      def process_google_callback(code)
        client = Signet::OAuth2::Client.new(
          client_id: ENV['GOOGLE_CLIENT_ID'],
          client_secret: ENV['GOOGLE_CLIENT_SECRET'],
          token_credential_uri: 'https://oauth2.googleapis.com/token',
          redirect_uri: "#{ENV['APP_URL']}/api/v1/calendar_integrations/callback?provider=google_calendar",
          code: code,
          grant_type: 'authorization_code'
        )

        client.fetch_access_token!

        integration = current_user.calendar_integrations.find_or_initialize_by(provider: 'google_calendar')
        integration.assign_attributes(
          tenant: current_tenant,
          status: 'active',
          access_token: client.access_token,
          refresh_token: client.refresh_token,
          token_expires_at: Time.current + client.expires_in.seconds,
          sync_direction: 'bidirectional'
        )
        integration.save!

        { success: true, integration: integration }
      rescue StandardError => e
        { success: false, error: e.message }
      end

      def process_outlook_callback(code)
        { success: false, error: 'Outlook integration not yet implemented' }
      end

      def integration_response(integration)
        {
          id: integration.id,
          provider: integration.provider,
          status: integration.status,
          calendar_id: integration.calendar_id,
          sync_direction: integration.sync_direction,
          sync_availability: integration.sync_availability,
          sync_bookings: integration.sync_bookings,
          last_synced_at: integration.last_synced_at,
          last_sync_error: integration.last_sync_error,
          created_at: integration.created_at
        }
      end
    end
  end
end
