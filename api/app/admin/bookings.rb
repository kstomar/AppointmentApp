ActiveAdmin.register Booking do
  menu priority: 3

  permit_params :business_id, :service_id, :staff_member_id, :client_id, :location_id,
                :status, :booking_type, :start_at, :end_at, :duration_minutes,
                :total_amount_cents, :deposit_amount_cents, :paid_amount_cents,
                :payment_status, :client_notes, :internal_notes, :source

  filter :confirmation_code
  filter :status
  filter :payment_status
  filter :business
  filter :service
  filter :staff_member
  filter :start_at
  filter :created_at

  scope :all, default: true
  scope :pending do |bookings|
    bookings.where(status: 'pending')
  end
  scope :confirmed do |bookings|
    bookings.where(status: 'confirmed')
  end
  scope :completed do |bookings|
    bookings.where(status: 'completed')
  end
  scope :cancelled do |bookings|
    bookings.where(status: 'cancelled')
  end
  scope :no_show do |bookings|
    bookings.where(status: 'no_show')
  end
  scope :today do |bookings|
    bookings.where('start_at >= ? AND start_at < ?', Date.current.beginning_of_day, Date.current.end_of_day)
  end

  index do
    selectable_column
    id_column
    column :confirmation_code
    column :client do |booking|
      booking.client&.full_name
    end
    column :service do |booking|
      booking.service&.name
    end
    column :staff_member do |booking|
      booking.staff_member&.user&.full_name
    end
    column :start_at
    column :status
    column :payment_status
    column :total_amount do |booking|
      number_to_currency(booking.total_amount_cents / 100.0) if booking.total_amount_cents
    end
    actions
  end

  show do
    attributes_table do
      row :id
      row :confirmation_code
      row :business
      row :service
      row :staff_member do |booking|
        booking.staff_member&.user&.full_name
      end
      row :client do |booking|
        booking.client&.full_name
      end
      row :location
      row :status
      row :booking_type
      row :start_at
      row :end_at
      row :duration_minutes
      row :total_amount do |booking|
        number_to_currency(booking.total_amount_cents / 100.0) if booking.total_amount_cents
      end
      row :deposit_amount do |booking|
        number_to_currency(booking.deposit_amount_cents / 100.0) if booking.deposit_amount_cents
      end
      row :paid_amount do |booking|
        number_to_currency(booking.paid_amount_cents / 100.0) if booking.paid_amount_cents
      end
      row :payment_status
      row :client_notes
      row :internal_notes
      row :source
      row :created_at
      row :updated_at
    end

    panel "Payments" do
      table_for booking.payments do
        column :id
        column :amount do |payment|
          number_to_currency(payment.amount_cents / 100.0)
        end
        column :status
        column :provider
        column :payment_type
        column :created_at
      end
    end

    panel "Notifications" do
      table_for booking.notifications do
        column :notification_type
        column :channel
        column :status
        column :sent_at
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :business
      f.input :service
      f.input :staff_member
      f.input :client
      f.input :location
      f.input :status, as: :select, collection: %w[pending confirmed completed cancelled no_show]
      f.input :booking_type, as: :select, collection: %w[standard recurring group waitlist]
      f.input :start_at, as: :datetime_picker
      f.input :end_at, as: :datetime_picker
      f.input :duration_minutes
      f.input :total_amount_cents
      f.input :deposit_amount_cents
      f.input :paid_amount_cents
      f.input :payment_status, as: :select, collection: %w[pending partial paid refunded]
      f.input :client_notes
      f.input :internal_notes
      f.input :source, as: :select, collection: %w[web mobile admin api widget]
    end
    f.actions
  end

  member_action :confirm, method: :put do
    resource.update(status: 'confirmed')
    redirect_to admin_booking_path(resource), notice: "Booking confirmed!"
  end

  member_action :cancel, method: :put do
    resource.update(status: 'cancelled')
    redirect_to admin_booking_path(resource), notice: "Booking cancelled!"
  end

  member_action :complete, method: :put do
    resource.update(status: 'completed')
    redirect_to admin_booking_path(resource), notice: "Booking marked as completed!"
  end

  member_action :no_show, method: :put do
    resource.update(status: 'no_show')
    redirect_to admin_booking_path(resource), notice: "Booking marked as no-show!"
  end

  action_item :confirm, only: :show, if: proc { resource.status == 'pending' } do
    link_to 'Confirm Booking', confirm_admin_booking_path(resource), method: :put
  end

  action_item :cancel, only: :show, if: proc { %w[pending confirmed].include?(resource.status) } do
    link_to 'Cancel Booking', cancel_admin_booking_path(resource), method: :put
  end

  action_item :complete, only: :show, if: proc { resource.status == 'confirmed' } do
    link_to 'Mark Complete', complete_admin_booking_path(resource), method: :put
  end

  action_item :no_show, only: :show, if: proc { resource.status == 'confirmed' } do
    link_to 'Mark No-Show', no_show_admin_booking_path(resource), method: :put
  end
end
