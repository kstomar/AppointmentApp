module Notifications
  class EmailService < BaseService
    def initialize
      super()
      configure_sendgrid
    end

    def send_email(to:, subject:, body:, from: nil, template_id: nil, dynamic_data: {})
      begin
        mail = SendGrid::Mail.new
        mail.from = SendGrid::Email.new(email: from || default_from_email, name: default_from_name)
        
        personalization = SendGrid::Personalization.new
        personalization.add_to(SendGrid::Email.new(email: to))
        personalization.subject = subject

        if template_id.present?
          mail.template_id = template_id
          dynamic_data.each do |key, value|
            personalization.add_dynamic_template_data(key.to_s => value)
          end
        else
          mail.add_content(SendGrid::Content.new(type: 'text/html', value: body))
        end

        mail.add_personalization(personalization)

        response = sendgrid_client.mail._('send').post(request_body: mail.to_json)

        if response.status_code.to_i >= 200 && response.status_code.to_i < 300
          set_result({
            status: 'sent',
            message_id: response.headers['x-message-id']&.first
          })
        else
          add_error("SendGrid error: #{response.body}")
        end
      rescue StandardError => e
        add_error("Email sending failed: #{e.message}")
      end

      self
    end

    def send_booking_confirmation(booking)
      template = find_template(booking.business, 'booking_confirmation', 'email')
      
      variables = booking_variables(booking)
      rendered = template ? template.render(variables) : default_confirmation_email(booking)

      send_email(
        to: booking.client.email,
        subject: rendered[:subject] || "Booking Confirmed - #{booking.confirmation_code}",
        body: rendered[:body],
        dynamic_data: variables
      )
    end

    def send_booking_reminder(booking)
      template = find_template(booking.business, 'booking_reminder', 'email')
      
      variables = booking_variables(booking)
      rendered = template ? template.render(variables) : default_reminder_email(booking)

      send_email(
        to: booking.client.email,
        subject: rendered[:subject] || "Reminder: Your appointment is coming up",
        body: rendered[:body],
        dynamic_data: variables
      )
    end

    def send_booking_cancelled(booking)
      template = find_template(booking.business, 'booking_cancelled', 'email')
      
      variables = booking_variables(booking)
      rendered = template ? template.render(variables) : default_cancellation_email(booking)

      send_email(
        to: booking.client.email,
        subject: rendered[:subject] || "Booking Cancelled - #{booking.confirmation_code}",
        body: rendered[:body],
        dynamic_data: variables
      )
    end

    def send_booking_rescheduled(booking)
      template = find_template(booking.business, 'booking_rescheduled', 'email')
      
      variables = booking_variables(booking)
      rendered = template ? template.render(variables) : default_rescheduled_email(booking)

      send_email(
        to: booking.client.email,
        subject: rendered[:subject] || "Booking Rescheduled - #{booking.confirmation_code}",
        body: rendered[:body],
        dynamic_data: variables
      )
    end

    def send_payment_receipt(payment)
      booking = payment.booking
      
      send_email(
        to: payment.user.email,
        subject: "Payment Receipt - #{booking&.confirmation_code || payment.id}",
        body: payment_receipt_body(payment)
      )
    end

    private

    def configure_sendgrid
      @api_key = ENV['SENDGRID_API_KEY']
    end

    def sendgrid_client
      @sendgrid_client ||= SendGrid::API.new(api_key: @api_key).client
    end

    def default_from_email
      ENV.fetch('MAILER_FROM_ADDRESS', 'noreply@example.com')
    end

    def default_from_name
      ENV.fetch('MAILER_FROM_NAME', 'Appointment Platform')
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
        client_email: booking.client.email,
        service_name: booking.service.name,
        staff_name: booking.staff_member&.display_name,
        business_name: booking.business.name,
        confirmation_code: booking.confirmation_code,
        date: booking.start_at.strftime('%B %d, %Y'),
        time: booking.start_at.strftime('%I:%M %p'),
        duration: "#{booking.duration_minutes} minutes",
        location: booking.location&.full_address,
        total_amount: booking.total_amount&.format,
        booking_url: "#{ENV['APP_URL']}/bookings/#{booking.confirmation_code}"
      }
    end

    def default_confirmation_email(booking)
      {
        subject: "Booking Confirmed - #{booking.confirmation_code}",
        body: <<~HTML
          <h2>Your booking is confirmed!</h2>
          <p>Hi #{booking.client.first_name},</p>
          <p>Your appointment has been confirmed. Here are the details:</p>
          <ul>
            <li><strong>Service:</strong> #{booking.service.name}</li>
            <li><strong>Date:</strong> #{booking.start_at.strftime('%B %d, %Y')}</li>
            <li><strong>Time:</strong> #{booking.start_at.strftime('%I:%M %p')}</li>
            <li><strong>Duration:</strong> #{booking.duration_minutes} minutes</li>
            <li><strong>Location:</strong> #{booking.location&.full_address || 'TBD'}</li>
            <li><strong>Confirmation Code:</strong> #{booking.confirmation_code}</li>
          </ul>
          <p>If you need to reschedule or cancel, please contact us.</p>
          <p>Thank you for booking with #{booking.business.name}!</p>
        HTML
      }
    end

    def default_reminder_email(booking)
      {
        subject: "Reminder: Your appointment is coming up",
        body: <<~HTML
          <h2>Appointment Reminder</h2>
          <p>Hi #{booking.client.first_name},</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <ul>
            <li><strong>Service:</strong> #{booking.service.name}</li>
            <li><strong>Date:</strong> #{booking.start_at.strftime('%B %d, %Y')}</li>
            <li><strong>Time:</strong> #{booking.start_at.strftime('%I:%M %p')}</li>
            <li><strong>Location:</strong> #{booking.location&.full_address || 'TBD'}</li>
          </ul>
          <p>We look forward to seeing you!</p>
        HTML
      }
    end

    def default_cancellation_email(booking)
      {
        subject: "Booking Cancelled - #{booking.confirmation_code}",
        body: <<~HTML
          <h2>Booking Cancelled</h2>
          <p>Hi #{booking.client.first_name},</p>
          <p>Your booking has been cancelled:</p>
          <ul>
            <li><strong>Service:</strong> #{booking.service.name}</li>
            <li><strong>Original Date:</strong> #{booking.start_at.strftime('%B %d, %Y')}</li>
            <li><strong>Original Time:</strong> #{booking.start_at.strftime('%I:%M %p')}</li>
          </ul>
          <p>If you'd like to rebook, please visit our booking page.</p>
        HTML
      }
    end

    def default_rescheduled_email(booking)
      {
        subject: "Booking Rescheduled - #{booking.confirmation_code}",
        body: <<~HTML
          <h2>Booking Rescheduled</h2>
          <p>Hi #{booking.client.first_name},</p>
          <p>Your booking has been rescheduled. Here are the new details:</p>
          <ul>
            <li><strong>Service:</strong> #{booking.service.name}</li>
            <li><strong>New Date:</strong> #{booking.start_at.strftime('%B %d, %Y')}</li>
            <li><strong>New Time:</strong> #{booking.start_at.strftime('%I:%M %p')}</li>
            <li><strong>Location:</strong> #{booking.location&.full_address || 'TBD'}</li>
          </ul>
          <p>We look forward to seeing you!</p>
        HTML
      }
    end

    def payment_receipt_body(payment)
      <<~HTML
        <h2>Payment Receipt</h2>
        <p>Thank you for your payment!</p>
        <ul>
          <li><strong>Amount:</strong> #{payment.amount.format}</li>
          <li><strong>Date:</strong> #{payment.paid_at&.strftime('%B %d, %Y')}</li>
          <li><strong>Payment Method:</strong> #{payment.payment_method || 'Card'}</li>
        </ul>
      HTML
    end
  end
end
