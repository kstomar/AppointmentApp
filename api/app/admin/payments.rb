ActiveAdmin.register Payment do
  menu priority: 5

  permit_params :booking_id, :amount_cents, :currency, :status, :provider,
                :payment_type, :refund_amount_cents, :refund_reason

  filter :status
  filter :provider
  filter :payment_type
  filter :booking
  filter :created_at

  scope :all, default: true
  scope :pending do |payments|
    payments.where(status: 'pending')
  end
  scope :completed do |payments|
    payments.where(status: 'completed')
  end
  scope :failed do |payments|
    payments.where(status: 'failed')
  end
  scope :refunded do |payments|
    payments.where(status: 'refunded')
  end

  index do
    selectable_column
    id_column
    column :booking do |payment|
      payment.booking&.confirmation_code
    end
    column :amount do |payment|
      number_to_currency(payment.amount_cents / 100.0)
    end
    column :currency
    column :status
    column :provider
    column :payment_type
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :booking do |payment|
        link_to payment.booking&.confirmation_code, admin_booking_path(payment.booking) if payment.booking
      end
      row :amount do |payment|
        number_to_currency(payment.amount_cents / 100.0)
      end
      row :currency
      row :status
      row :provider
      row :payment_type
      row :provider_payment_id
      row :provider_customer_id
      row :refund_amount do |payment|
        number_to_currency(payment.refund_amount_cents / 100.0) if payment.refund_amount_cents
      end
      row :refund_reason
      row :refunded_at
      row :metadata
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs do
      f.input :booking
      f.input :amount_cents
      f.input :currency, as: :select, collection: %w[USD EUR GBP INR CAD AUD]
      f.input :status, as: :select, collection: %w[pending processing completed failed refunded partially_refunded]
      f.input :provider, as: :select, collection: %w[stripe razorpay cash other]
      f.input :payment_type, as: :select, collection: %w[deposit full_payment partial refund]
      f.input :refund_amount_cents
      f.input :refund_reason
    end
    f.actions
  end

  member_action :refund, method: :get do
    @payment = Payment.find(params[:id])
    render 'admin/payments/refund'
  end

  member_action :process_refund, method: :post do
    @payment = Payment.find(params[:id])
    refund_amount = params[:refund_amount].to_i
    reason = params[:reason]

    if refund_amount > 0 && refund_amount <= @payment.amount_cents
      @payment.update(
        status: refund_amount == @payment.amount_cents ? 'refunded' : 'partially_refunded',
        refund_amount_cents: refund_amount,
        refund_reason: reason,
        refunded_at: Time.current
      )
      redirect_to admin_payment_path(@payment), notice: "Refund processed successfully!"
    else
      redirect_to refund_admin_payment_path(@payment), alert: "Invalid refund amount"
    end
  end

  action_item :refund, only: :show, if: proc { resource.status == 'completed' } do
    link_to 'Process Refund', refund_admin_payment_path(resource)
  end
end
