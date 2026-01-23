class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :booking, type: :uuid, foreign_key: true
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.string :payment_type, null: false
      t.string :status, default: 'pending', null: false
      t.string :provider, null: false
      t.string :provider_payment_id
      t.string :provider_customer_id
      t.monetize :amount, currency: { present: false }
      t.monetize :refunded_amount, currency: { present: false }
      t.monetize :fee_amount, currency: { present: false }
      t.string :currency, default: 'USD', null: false
      t.string :payment_method
      t.string :card_last_four
      t.string :card_brand
      t.text :failure_reason
      t.jsonb :provider_response, default: {}
      t.jsonb :metadata, default: {}
      t.datetime :paid_at
      t.datetime :refunded_at
      t.datetime :failed_at

      t.timestamps
    end

    add_index :payments, :provider_payment_id
    add_index :payments, :status
    add_index :payments, :payment_type
    add_index :payments, [:business_id, :created_at]

    create_table :invoices, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :business, type: :uuid, null: false, foreign_key: true
      t.references :client, type: :uuid, null: false, foreign_key: { to_table: :users }
      t.references :booking, type: :uuid, foreign_key: true
      t.string :invoice_number, null: false
      t.string :status, default: 'draft', null: false
      t.monetize :subtotal, currency: { present: false }
      t.monetize :tax_amount, currency: { present: false }
      t.monetize :discount_amount, currency: { present: false }
      t.monetize :total_amount, currency: { present: false }
      t.monetize :paid_amount, currency: { present: false }
      t.string :currency, default: 'USD', null: false
      t.date :issue_date
      t.date :due_date
      t.datetime :paid_at
      t.text :notes
      t.text :terms
      t.jsonb :line_items, default: []
      t.jsonb :tax_details, default: {}
      t.jsonb :insurance_info, default: {}
      t.boolean :is_insurance_claim, default: false

      t.timestamps
    end

    add_index :invoices, [:business_id, :invoice_number], unique: true
    add_index :invoices, :status
    add_index :invoices, :due_date

    create_table :refunds, id: :uuid do |t|
      t.references :tenant, type: :uuid, null: false, foreign_key: true
      t.references :payment, type: :uuid, null: false, foreign_key: true
      t.references :processed_by, type: :uuid, foreign_key: { to_table: :users }
      t.string :status, default: 'pending', null: false
      t.monetize :amount, currency: { present: false }
      t.string :reason
      t.string :provider_refund_id
      t.jsonb :provider_response, default: {}
      t.datetime :processed_at

      t.timestamps
    end

    add_index :refunds, :provider_refund_id
    add_index :refunds, :status
  end
end
