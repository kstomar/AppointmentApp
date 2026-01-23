class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.string :email, null: false
      t.string :encrypted_password, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :phone
      t.string :phone_country_code
      t.string :role, null: false, default: 'client'
      t.string :status, default: 'active', null: false
      t.string :avatar_url
      t.string :timezone
      t.string :locale, default: 'en'
      t.jsonb :preferences, default: {}
      t.jsonb :metadata, default: {}
      t.text :encrypted_ssn
      t.string :encrypted_ssn_bidx
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.integer :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string :current_sign_in_ip
      t.string :last_sign_in_ip
      t.string :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string :unconfirmed_email
      t.integer :failed_attempts, default: 0, null: false
      t.string :unlock_token
      t.datetime :locked_at
      t.datetime :discarded_at
      t.datetime :last_activity_at

      t.timestamps
    end

    add_index :users, [:tenant_id, :email], unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token, unique: true
    add_index :users, :unlock_token, unique: true
    add_index :users, :encrypted_ssn_bidx
    add_index :users, :role
    add_index :users, :status
    add_index :users, :discarded_at
  end
end
