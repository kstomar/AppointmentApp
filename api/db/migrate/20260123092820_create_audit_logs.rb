class CreateAuditLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :audit_logs, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, foreign_key: true
      t.string :auditable_type
      t.uuid :auditable_id
      t.string :action, null: false
      t.jsonb :audited_changes, default: {}
      t.jsonb :metadata, default: {}
      t.string :ip_address
      t.string :user_agent
      t.string :request_id
      t.datetime :created_at, null: false
    end

    add_index :audit_logs, [:auditable_type, :auditable_id]
    add_index :audit_logs, :action
    add_index :audit_logs, :created_at
    add_index :audit_logs, [:tenant_id, :created_at]

    create_table :api_keys, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :key_digest, null: false
      t.string :key_prefix, null: false
      t.jsonb :scopes, default: []
      t.string :status, default: 'active', null: false
      t.datetime :last_used_at
      t.datetime :expires_at
      t.datetime :revoked_at

      t.timestamps
    end

    add_index :api_keys, :key_digest, unique: true
    add_index :api_keys, :key_prefix
    add_index :api_keys, :status

    create_table :webhooks, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, foreign_key: true
      t.string :url, null: false
      t.string :secret_digest
      t.jsonb :events, default: []
      t.string :status, default: 'active', null: false
      t.integer :failure_count, default: 0
      t.datetime :last_triggered_at
      t.datetime :last_success_at
      t.datetime :last_failure_at
      t.text :last_failure_reason

      t.timestamps
    end

    add_index :webhooks, :status

    create_table :webhook_deliveries, id: :uuid do |t|
      t.references :webhook, type: :uuid, null: false, foreign_key: true
      t.string :event_type, null: false
      t.jsonb :payload, default: {}
      t.string :status, default: 'pending', null: false
      t.integer :response_code
      t.text :response_body
      t.integer :attempt_count, default: 0
      t.datetime :delivered_at
      t.datetime :next_retry_at

      t.timestamps
    end

    add_index :webhook_deliveries, :status
    add_index :webhook_deliveries, :next_retry_at

    create_table :feature_flags, id: :uuid do |t|
      t.references :tenant, type: :uuid, foreign_key: true
      t.string :name, null: false
      t.string :description
      t.boolean :enabled, default: false
      t.jsonb :rules, default: {}
      t.integer :percentage, default: 0

      t.timestamps
    end

    add_index :feature_flags, [:tenant_id, :name], unique: true
  end
end
