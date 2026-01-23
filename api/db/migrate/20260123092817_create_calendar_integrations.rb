class CreateCalendarIntegrations < ActiveRecord::Migration[7.1]
  def change
    create_table :calendar_integrations, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.references :staff_member, type: :uuid, foreign_key: true
      t.string :provider, null: false
      t.string :status, default: 'active', null: false
      t.string :calendar_id
      t.string :calendar_name
      t.text :encrypted_access_token
      t.text :encrypted_refresh_token
      t.datetime :token_expires_at
      t.string :sync_direction, default: 'bidirectional'
      t.boolean :sync_availability, default: true
      t.boolean :sync_bookings, default: true
      t.boolean :block_external_events, default: true
      t.jsonb :sync_settings, default: {}
      t.datetime :last_synced_at
      t.datetime :last_sync_error_at
      t.text :last_sync_error
      t.string :webhook_channel_id
      t.datetime :webhook_expires_at

      t.timestamps
    end

    add_index :calendar_integrations, [:user_id, :provider], unique: true
    add_index :calendar_integrations, :status
    add_index :calendar_integrations, :provider

    create_table :calendar_events, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :calendar_integration, type: :uuid, null: false, foreign_key: true
      t.references :booking, type: :uuid, foreign_key: true
      t.string :external_event_id, null: false
      t.string :status, default: 'active'
      t.string :title
      t.text :description
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.boolean :is_all_day, default: false
      t.boolean :is_blocking, default: true
      t.string :location
      t.jsonb :attendees, default: []
      t.jsonb :raw_data, default: {}
      t.datetime :synced_at

      t.timestamps
    end

    add_index :calendar_events, [:calendar_integration_id, :external_event_id], 
              unique: true, 
              name: 'idx_calendar_events_integration_external'
    add_index :calendar_events, [:calendar_integration_id, :start_at, :end_at], 
              name: 'idx_calendar_events_time_range'
  end
end
