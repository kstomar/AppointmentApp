class CreateIntakeForms < ActiveRecord::Migration[7.1]
  def change
    create_table :intake_forms, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.references :service, type: :uuid, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.string :status, default: 'active', null: false
      t.boolean :is_required, default: false
      t.jsonb :fields, default: []
      t.jsonb :conditional_logic, default: {}
      t.integer :sort_order, default: 0

      t.timestamps
    end

    add_index :intake_forms, [:business_id, :name]
    add_index :intake_forms, :status

    create_table :intake_form_responses, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :intake_form, type: :uuid, null: false, foreign_key: true
      t.references :booking, type: :uuid, foreign_key: true
      t.references :client, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.jsonb :responses, default: {}
      t.jsonb :encrypted_responses, default: {}
      t.datetime :submitted_at
      t.string :status, default: 'draft'

      t.timestamps
    end

    add_index :intake_form_responses, [:intake_form_id, :client_id]
    add_index :intake_form_responses, :status
  end
end
