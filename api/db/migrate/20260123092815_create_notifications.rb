class CreateNotifications < ActiveRecord::Migration[7.1]
  def change
    create_table :notifications, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.references :booking, type: :uuid, foreign_key: true
      t.string :notification_type, null: false
      t.string :channel, null: false
      t.string :status, default: 'pending', null: false
      t.string :subject
      t.text :body
      t.string :recipient_email
      t.string :recipient_phone
      t.string :provider_message_id
      t.jsonb :provider_response, default: {}
      t.jsonb :metadata, default: {}
      t.datetime :scheduled_for
      t.datetime :sent_at
      t.datetime :delivered_at
      t.datetime :read_at
      t.datetime :failed_at
      t.text :failure_reason
      t.integer :retry_count, default: 0

      t.timestamps
    end

    add_index :notifications, :notification_type
    add_index :notifications, :channel
    add_index :notifications, :status
    add_index :notifications, :scheduled_for
    add_index :notifications, [:user_id, :read_at]

    create_table :notification_templates, id: :uuid do |t|
      t.references :tenant, type: :uuid, foreign_key: true
      t.references :business, type: :uuid, foreign_key: true
      t.string :name, null: false
      t.string :template_type, null: false
      t.string :channel, null: false
      t.string :subject
      t.text :body, null: false
      t.jsonb :variables, default: []
      t.boolean :is_active, default: true
      t.boolean :is_system, default: false
      t.string :locale, default: 'en'

      t.timestamps
    end

    add_index :notification_templates, [:business_id, :template_type, :channel, :locale], 
              unique: true, 
              name: 'idx_notification_templates_unique'
    add_index :notification_templates, :is_system

    create_table :notification_preferences, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :notification_type, null: false
      t.boolean :email_enabled, default: true
      t.boolean :sms_enabled, default: true
      t.boolean :push_enabled, default: true
      t.boolean :in_app_enabled, default: true

      t.timestamps
    end

    add_index :notification_preferences, [:user_id, :notification_type], unique: true
  end
end
