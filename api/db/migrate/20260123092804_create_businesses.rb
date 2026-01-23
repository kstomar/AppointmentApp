class CreateBusinesses < ActiveRecord::Migration[7.1]
  def change
    create_table :businesses, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :owner, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.string :name, null: false
      t.string :slug, null: false
      t.string :description
      t.string :industry, null: false
      t.string :status, default: 'active', null: false
      t.string :phone
      t.string :email
      t.string :website
      t.string :logo_url
      t.string :cover_image_url
      t.string :timezone, null: false
      t.string :currency, default: 'USD', null: false
      t.string :country_code
      t.jsonb :settings, default: {}
      t.jsonb :booking_settings, default: {}
      t.jsonb :notification_settings, default: {}
      t.jsonb :payment_settings, default: {}
      t.jsonb :social_links, default: {}
      t.integer :booking_lead_time_minutes, default: 60
      t.integer :booking_window_days, default: 30
      t.integer :cancellation_policy_hours, default: 24
      t.boolean :requires_payment, default: false
      t.boolean :auto_confirm_bookings, default: true
      t.boolean :allow_waitlist, default: true
      t.decimal :deposit_percentage, precision: 5, scale: 2, default: 0
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :businesses, [:tenant_id, :slug], unique: true
    add_index :businesses, :status
    add_index :businesses, :industry
    add_index :businesses, :discarded_at
  end
end
