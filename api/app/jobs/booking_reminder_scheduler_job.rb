class BookingReminderSchedulerJob < ApplicationJob
  queue_as :schedulers

  def perform
    schedule_24_hour_reminders
    schedule_2_hour_reminders
  end

  private

  def schedule_24_hour_reminders
    bookings = Booking.confirmed
                      .where(start_at: 23.hours.from_now..25.hours.from_now)
                      .where.not(id: already_scheduled_booking_ids('24h'))

    bookings.find_each do |booking|
      Notifications::BookingReminderJob.set(wait_until: booking.start_at - 24.hours)
                                       .perform_later(booking.id)
      
      mark_reminder_scheduled(booking, '24h')
    end
  end

  def schedule_2_hour_reminders
    bookings = Booking.confirmed
                      .where(start_at: 1.hour.from_now..3.hours.from_now)
                      .where.not(id: already_scheduled_booking_ids('2h'))

    bookings.find_each do |booking|
      Notifications::BookingReminderJob.set(wait_until: booking.start_at - 2.hours)
                                       .perform_later(booking.id)
      
      mark_reminder_scheduled(booking, '2h')
    end
  end

  def already_scheduled_booking_ids(reminder_type)
    Booking.where("metadata->>'#{reminder_type}_reminder_scheduled' = ?", 'true').pluck(:id)
  end

  def mark_reminder_scheduled(booking, reminder_type)
    booking.update_column(:metadata, booking.metadata.merge("#{reminder_type}_reminder_scheduled" => true))
  end
end
