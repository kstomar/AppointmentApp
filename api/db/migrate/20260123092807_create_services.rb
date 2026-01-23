class CreateServices < ActiveRecord::Migration[7.1]
  def change
    create_table :services, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.references :category, type: :uuid, foreign_key: { to_table: :services }
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.string :service_type, default: 'appointment', null: false
      t.string :status, default: 'active', null: false
      t.integer :duration_minutes, null: false
      t.integer :buffer_before_minutes, default: 0
      t.integer :buffer_after_minutes, default: 0
      t.integer :max_attendees, default: 1
      t.integer :min_attendees, default: 1
      t.monetize :price, currency: { present: false }
      t.monetize :deposit_amount, currency: { present: false }
      t.string :color
      t.string :image_url
      t.boolean :is_category, default: false
      t.boolean :is_public, default: true
      t.boolean :requires_confirmation, default: false
      t.boolean :allow_online_booking, default: true
      t.boolean :allow_waitlist, default: true
      t.jsonb :settings, default: {}
      t.jsonb :intake_form_config, default: {}
      t.integer :sort_order, default: 0
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :services, [:business_id, :slug], unique: true
    add_index :services, :status
    add_index :services, :service_type
    add_index :services, :is_category
    add_index :services, :is_public
    add_index :services, :discarded_at
  end
end
