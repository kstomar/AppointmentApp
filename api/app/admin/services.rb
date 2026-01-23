ActiveAdmin.register Service do
  menu parent: "Businesses", priority: 2

  permit_params :business_id, :category_id, :name, :slug, :description, :service_type,
                :duration_minutes, :buffer_before_minutes, :buffer_after_minutes,
                :price_cents, :currency, :deposit_amount_cents, :max_attendees,
                :min_attendees, :is_public, :allow_online_booking, :requires_confirmation,
                :status, :settings

  filter :name
  filter :business
  filter :service_type
  filter :status
  filter :is_public
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :business
    column :service_type
    column :duration_minutes
    column :price do |service|
      number_to_currency(service.price_cents / 100.0) if service.price_cents
    end
    column :is_public
    column :status
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :slug
      row :description
      row :business
      row :category
      row :service_type
      row :duration_minutes
      row :buffer_before_minutes
      row :buffer_after_minutes
      row :price do |service|
        number_to_currency(service.price_cents / 100.0) if service.price_cents
      end
      row :deposit_amount do |service|
        number_to_currency(service.deposit_amount_cents / 100.0) if service.deposit_amount_cents
      end
      row :max_attendees
      row :min_attendees
      row :is_public
      row :allow_online_booking
      row :requires_confirmation
      row :status
      row :created_at
      row :updated_at
    end

    panel "Staff Members" do
      table_for service.staff_members do
        column :user do |staff|
          staff.user&.full_name
        end
        column :title
        column :is_bookable
      end
    end

    panel "Recent Bookings" do
      table_for service.bookings.order(created_at: :desc).limit(10) do
        column :confirmation_code
        column :client do |booking|
          booking.client&.full_name
        end
        column :start_at
        column :status
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :business
      f.input :category
      f.input :name
      f.input :slug
      f.input :description
      f.input :service_type, as: :select, collection: %w[appointment class consultation home_visit virtual]
      f.input :duration_minutes
      f.input :buffer_before_minutes
      f.input :buffer_after_minutes
      f.input :price_cents
      f.input :currency, as: :select, collection: %w[USD EUR GBP INR CAD AUD]
      f.input :deposit_amount_cents
      f.input :max_attendees
      f.input :min_attendees
      f.input :is_public
      f.input :allow_online_booking
      f.input :requires_confirmation
      f.input :status, as: :select, collection: %w[active inactive archived]
    end
    f.actions
  end
end
