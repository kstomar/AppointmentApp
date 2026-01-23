module Api
  module V1
    class NotificationsController < BaseController
      before_action :set_notification, only: [:show, :mark_read]

      def index
        @notifications = policy_scope(current_user.notifications)
        @notifications = @notifications.where(channel: 'in_app')
        @notifications = @notifications.unread if params[:unread_only] == 'true'
        @notifications = @notifications.order(created_at: :desc).page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@notifications)
      end

      def show
        authorize @notification
        render_success(notification_response(@notification))
      end

      def mark_read
        authorize @notification

        @notification.mark_read!
        render_success(notification_response(@notification))
      end

      def mark_all_read
        current_user.notifications.in_app.unread.update_all(read_at: Time.current)
        render_success(message: 'All notifications marked as read')
      end

      def unread_count
        count = current_user.notifications.where(channel: 'in_app').unread.count
        render_success({ count: count })
      end

      def preferences
        @preferences = current_user.notification_preferences
        render_success(@preferences.map { |p| preference_response(p) })
      end

      def update_preferences
        params[:preferences].each do |pref_params|
          preference = current_user.notification_preferences.find_or_initialize_by(
            notification_type: pref_params[:notification_type]
          )
          preference.update!(
            email_enabled: pref_params[:email_enabled],
            sms_enabled: pref_params[:sms_enabled],
            push_enabled: pref_params[:push_enabled],
            in_app_enabled: pref_params[:in_app_enabled]
          )
        end

        render_success(message: 'Preferences updated')
      end

      private

      def skip_authorization?
        action_name.in?(%w[mark_all_read unread_count preferences update_preferences])
      end

      def set_notification
        @notification = current_user.notifications.find(params[:id])
      end

      def notification_response(notification)
        {
          id: notification.id,
          notification_type: notification.notification_type,
          channel: notification.channel,
          status: notification.status,
          subject: notification.subject,
          body: notification.body,
          read_at: notification.read_at,
          sent_at: notification.sent_at,
          booking_id: notification.booking_id,
          created_at: notification.created_at
        }
      end

      def preference_response(preference)
        {
          notification_type: preference.notification_type,
          email_enabled: preference.email_enabled,
          sms_enabled: preference.sms_enabled,
          push_enabled: preference.push_enabled,
          in_app_enabled: preference.in_app_enabled
        }
      end
    end
  end
end
