module Notifications
  class SmsService < BaseService
    def initialize
      super()
      configure_twilio
    end

    def send_sms(to:, body:, from: nil)
      return add_error('Phone number is required') if to.blank?
      return add_error('Message body is required') if body.blank?

      begin
        formatted_to = format_phone_number(to)
        
        message = twilio_client.messages.create(
          from: from || twilio_phone_number,
          to: formatted_to,
          body: body.truncate(1600)
        )

        set_result({
          status: 'sent',
          message_sid: message.sid,
          to: formatted_to
        })
      rescue Twilio::REST::RestError => e
        add_error("Twilio error: #{e.message}")
      rescue StandardError => e
        add_error("SMS sending failed: #{e.message}")
      end

      self
    end

    def send_booking_confirmation(booking)
      return self unless booking.client.phone.present?

      template = find_template(booking.business, 'booking_confirmation', 'sms')
      variables = booking_variables(booking)
      
      body = if template
               template.render(variables)[:body]
             else
               default_confirmation_sms(booking)
             end

      send_sms(to: booking.client.phone, body: body)
    end

    def send_booking_reminder(booking)
      return self unless booking.client.phone.present?

      template = find_template(booking.business, 'booking_reminder', 'sms')
      variables = booking_variables(booking)
      
      body = if template
               template.render(variables)[:body]
             else
               default_reminder_sms(booking)
             end

      send_sms(to: booking.client.phone, body: body)
    end

    def send_booking_cancelled(booking)
      return self unless booking.client.phone.present?

      template = find_template(booking.business, 'booking_cancelled', 'sms')
      variables = booking_variables(booking)
      
      body = if template
               template.render(variables)[:body]
             else
               default_cancellation_sms(booking)
             end

      send_sms(to: booking.client.phone, body: body)
    end

    def send_booking_rescheduled(booking)
      return self unless booking.client.phone.present?

      template = find_template(booking.business, 'booking_rescheduled', 'sms')
      variables = booking_variables(booking)
      
      body = if template
               template.render(variables)[:body]
             else
               default_rescheduled_sms(booking)
             end

      send_sms(to: booking.client.phone, body: body)
    end

    def send_waitlist_notification(waitlist_entry, available_slot)
      return self unless waitlist_entry.client.phone.present?

      body = "Good news! A slot is now available for #{waitlist_entry.service.name} on #{available_slot[:date]} at #{available_slot[:time]}. Book now before it's gone!"

      send_sms(to: waitlist_entry.client.phone, body: body)
    end

    def send_verification_code(phone:, code:)
      body = "Your verification code is: #{code}. This code expires in 10 minutes."
      send_sms(to: phone, body: body)
    end

    private

    def configure_twilio
      @account_sid = ENV['TWILIO_ACCOUNT_SID']
      @auth_token = ENV['TWILIO_AUTH_TOKEN']
      @phone_number = ENV['TWILIO_PHONE_NUMBER']
    end

    def twilio_client
      @twilio_client ||= Twilio::REST::Client.new(@account_sid, @auth_token)
    end

    def twilio_phone_number
      @phone_number
    end

    def format_phone_number(phone)
      parsed = Phonelib.parse(phone)
      parsed.e164.presence || phone
    end

    def find_template(business, template_type, channel)
      NotificationTemplate.find_template(
        business: business,
        template_type: template_type,
        channel: channel
      )
    end

    def booking_variables(booking)
      {
        client_name: booking.client.full_name,
        client_first_name: booking.client.first_name,
        service_name: booking.service.name,
        staff_name: booking.staff_member&.display_name,
        business_name: booking.business.name,
        confirmation_code: booking.confirmation_code,
        date: booking.start_at.strftime('%b %d'),
        time: booking.start_at.strftime('%I:%M %p'),
        location: booking.location&.name
      }
    end

    def default_confirmation_sms(booking)
      "Booking confirmed! #{booking.service.name} on #{booking.start_at.strftime('%b %d')} at #{booking.start_at.strftime('%I:%M %p')}. Code: #{booking.confirmation_code}. - #{booking.business.name}"
    end

    def default_reminder_sms(booking)
      "Reminder: #{booking.service.name} tomorrow at #{booking.start_at.strftime('%I:%M %p')}. See you soon! - #{booking.business.name}"
    end

    def default_cancellation_sms(booking)
      "Your booking for #{booking.service.name} on #{booking.start_at.strftime('%b %d')} has been cancelled. - #{booking.business.name}"
    end

    def default_rescheduled_sms(booking)
      "Your booking has been rescheduled to #{booking.start_at.strftime('%b %d')} at #{booking.start_at.strftime('%I:%M %p')}. Code: #{booking.confirmation_code}. - #{booking.business.name}"
    end
  end
end
