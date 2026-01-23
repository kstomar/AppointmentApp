class WaitlistNotificationJob < ApplicationJob
  queue_as :waitlist

  def perform(service_id:, staff_member_id: nil, date:, time:)
    service = Service.find_by(id: service_id)
    return unless service

    entries = WaitlistEntry.waiting
                           .for_service(service_id)
                           .for_date(Date.parse(date))
                           .by_priority

    entries = entries.for_staff(staff_member_id) if staff_member_id.present?

    entries.limit(3).each do |entry|
      notify_waitlist_entry(entry, date, time)
    end
  end

  private

  def notify_waitlist_entry(entry, date, time)
    ActsAsTenant.with_tenant(entry.tenant) do
      entry.notify!

      send_email_notification(entry, date, time)
      send_sms_notification(entry, date, time)
      create_in_app_notification(entry, date, time)

      schedule_expiration(entry)
    end
  end

  def send_email_notification(entry, date, time)
    return unless entry.client.email.present?

    service = Notifications::EmailService.new
    service.send_email(
      to: entry.client.email,
      subject: "A slot is now available for #{entry.service.name}!",
      body: waitlist_email_body(entry, date, time)
    )
  end

  def send_sms_notification(entry, date, time)
    return unless entry.client.phone.present?

    service = Notifications::SmsService.new
    service.send_waitlist_notification(entry, { date: date, time: time })
  end

  def create_in_app_notification(entry, date, time)
    Notification.create!(
      tenant: entry.tenant,
      user: entry.client,
      notification_type: 'waitlist_available',
      channel: 'in_app',
      status: 'sent',
      subject: 'Slot Available!',
      body: "A slot is now available for #{entry.service.name} on #{date} at #{time}. Book now!",
      sent_at: Time.current
    )
  end

  def waitlist_email_body(entry, date, time)
    <<~HTML
      <h2>Good news! A slot is now available.</h2>
      <p>Hi #{entry.client.first_name},</p>
      <p>A slot has opened up for <strong>#{entry.service.name}</strong>:</p>
      <ul>
        <li><strong>Date:</strong> #{date}</li>
        <li><strong>Time:</strong> #{time}</li>
      </ul>
      <p>Book now before someone else takes it!</p>
      <p>This offer expires in 2 hours.</p>
    HTML
  end

  def schedule_expiration(entry)
    WaitlistExpirationJob.set(wait: 2.hours).perform_later(entry.id)
  end
end
