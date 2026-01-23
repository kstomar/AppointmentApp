class CreateAvailabilityRules < ActiveRecord::Migration[7.1]
  def change
    create_table :availability_rules, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :staff_member, type: :uuid, foreign_key: true
      t.references :location, type: :uuid, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.string :rule_type, null: false
      t.string :name
      t.integer :day_of_week
      t.date :specific_date
      t.time :start_time
      t.time :end_time
      t.boolean :is_available, default: true
      t.boolean :is_recurring, default: true
      t.date :recurrence_start_date
      t.date :recurrence_end_date
      t.jsonb :recurrence_pattern, default: {}
      t.integer :priority, default: 0
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :availability_rules, [:staff_member_id, :day_of_week]
    add_index :availability_rules, [:staff_member_id, :specific_date]
    add_index :availability_rules, [:location_id, :day_of_week]
    add_index :availability_rules, :rule_type
    add_index :availability_rules, :discarded_at

    create_table :time_off_requests, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :staff_member, type: :uuid, null: false, foreign_key: true
      t.string :status, default: 'pending', null: false
      t.string :reason
      t.text :notes
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.boolean :is_all_day, default: false
      t.references :approved_by, type: :uuid, foreign_key: { to_table: :users }
      t.datetime :approved_at

      t.timestamps
    end

    add_index :time_off_requests, [:staff_member_id, :start_at, :end_at]
    add_index :time_off_requests, :status
  end
end
