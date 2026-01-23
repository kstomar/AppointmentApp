class CreateLocations < ActiveRecord::Migration[7.1]
  def change
    create_table :locations, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :address_line1
      t.string :address_line2
      t.string :city
      t.string :state
      t.string :postal_code
      t.string :country_code
      t.decimal :latitude, precision: 10, scale: 8
      t.decimal :longitude, precision: 11, scale: 8
      t.string :phone
      t.string :email
      t.string :timezone, null: false
      t.string :status, default: 'active', null: false
      t.boolean :is_primary, default: false
      t.boolean :is_virtual, default: false
      t.string :virtual_meeting_url
      t.jsonb :operating_hours, default: {}
      t.jsonb :settings, default: {}
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :locations, [:business_id, :is_primary]
    add_index :locations, :status
    add_index :locations, :discarded_at
    add_index :locations, [:latitude, :longitude]
  end
end
