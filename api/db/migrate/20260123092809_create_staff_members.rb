class CreateStaffMembers < ActiveRecord::Migration[7.1]
  def change
    create_table :staff_members, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.references :location, type: :uuid, foreign_key: true
      t.string :title
      t.string :bio
      t.string :status, default: 'active', null: false
      t.string :role, default: 'staff', null: false
      t.string :color
      t.string :avatar_url
      t.jsonb :skills, default: []
      t.jsonb :settings, default: {}
      t.boolean :accepts_new_clients, default: true
      t.boolean :is_bookable, default: true
      t.integer :max_daily_bookings
      t.integer :sort_order, default: 0
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :staff_members, [:business_id, :user_id], unique: true
    add_index :staff_members, :status
    add_index :staff_members, :is_bookable
    add_index :staff_members, :discarded_at

    create_table :staff_services, id: :uuid do |t|
      t.references :staff_member, type: :uuid, null: false, foreign_key: true
      t.references :service, type: :uuid, null: false, foreign_key: true
      t.monetize :custom_price, currency: { present: false }
      t.integer :custom_duration_minutes
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :staff_services, [:staff_member_id, :service_id], unique: true
  end
end
