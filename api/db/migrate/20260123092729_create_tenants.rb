class CreateTenants < ActiveRecord::Migration[7.1]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')
    enable_extension 'uuid-ossp' unless extension_enabled?('uuid-ossp')

    create_table :tenants, id: :uuid do |t|
      t.string :name, null: false
      t.string :subdomain, null: false
      t.string :custom_domain
      t.string :industry, null: false
      t.string :status, default: 'active', null: false
      t.string :plan, default: 'free', null: false
      t.string :timezone, default: 'UTC', null: false
      t.string :currency, default: 'USD', null: false
      t.string :country_code, default: 'US'
      t.string :locale, default: 'en'
      t.jsonb :settings, default: {}
      t.jsonb :branding, default: {}
      t.jsonb :features, default: {}
      t.boolean :hipaa_enabled, default: false
      t.boolean :gdpr_enabled, default: false
      t.datetime :trial_ends_at
      t.datetime :subscription_ends_at
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :tenants, :subdomain, unique: true
    add_index :tenants, :custom_domain, unique: true, where: 'custom_domain IS NOT NULL'
    add_index :tenants, :status
    add_index :tenants, :industry
    add_index :tenants, :discarded_at
  end
end
