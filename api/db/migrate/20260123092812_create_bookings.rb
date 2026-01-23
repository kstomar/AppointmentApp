class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.references :location, type: :uuid, foreign_key: true
      t.references :service, type: :uuid, null: false, foreign_key: true
      t.references :staff_member, type: :uuid, foreign_key: true
      t.references :client, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.references :booked_by, type: :uuid, foreign_key: { to_table: :users }
      t.references :parent_booking, type: :uuid, foreign_key: { to_table: :bookings }
      t.string :confirmation_code, null: false
      t.string :status, default: 'pending', null: false
      t.string :booking_type, default: 'single', null: false
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.integer :duration_minutes, null: false
      t.monetize :total_amount, currency: { present: false }
      t.monetize :deposit_amount, currency: { present: false }
      t.monetize :paid_amount, currency: { present: false }
      t.string :payment_status, default: 'unpaid'
      t.text :client_notes
      t.text :staff_notes
      t.text :internal_notes
      t.text :cancellation_reason
      t.datetime :cancelled_at
      t.references :cancelled_by, type: :uuid, foreign_key: { to_table: :users }
      t.datetime :confirmed_at
      t.datetime :completed_at
      t.datetime :no_show_at
      t.string :source, default: 'web'
      t.string :external_calendar_event_id
      t.jsonb :intake_form_responses, default: {}
      t.jsonb :metadata, default: {}
      t.boolean :is_recurring, default: false
      t.string :recurrence_rule
      t.integer :attendee_count, default: 1
      t.string :video_meeting_url
      t.datetime :reminder_sent_at
      t.datetime :follow_up_sent_at
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :bookings, :confirmation_code, unique: true
    add_index :bookings, :status
    add_index :bookings, :payment_status
    add_index :bookings, [:business_id, :start_at]
    add_index :bookings, [:staff_member_id, :start_at]
    add_index :bookings, [:client_id, :start_at]
    add_index :bookings, :start_at
    add_index :bookings, :discarded_at
    add_index :bookings, :external_calendar_event_id

    create_table :booking_attendees, id: :uuid do |t|
      t.references :booking, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, foreign_key: true
      t.string :name
      t.string :email
      t.string :phone
      t.string :status, default: 'confirmed'
      t.boolean :is_primary, default: false
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :booking_attendees, [:booking_id, :email]

    create_table :waitlist_entries, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.references :service, type: :uuid, null: false, foreign_key: true
      t.references :staff_member, type: :uuid, foreign_key: true
      t.references :client, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.date :preferred_date
      t.time :preferred_time_start
      t.time :preferred_time_end
      t.jsonb :preferred_days, default: []
      t.string :status, default: 'waiting', null: false
      t.text :notes
      t.datetime :notified_at
      t.datetime :expires_at
      t.integer :priority, default: 0

      t.timestamps
    end

    add_index :waitlist_entries, [:service_id, :status]
    add_index :waitlist_entries, [:staff_member_id, :status]
    add_index :waitlist_entries, :status
  end
end
