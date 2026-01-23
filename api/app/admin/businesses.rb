ActiveAdmin.register Business do
  menu priority: 2

  permit_params :tenant_id, :owner_id, :name, :slug, :description, :industry, :status,
                :phone, :email, :website, :timezone, :currency, :logo_url,
                :booking_lead_time_minutes, :booking_window_days, :cancellation_policy_hours,
                :deposit_percentage, :settings

  filter :name
  filter :industry
  filter :status
  filter :tenant
  filter :created_at

  scope :all, default: true
  scope :active do |businesses|
    businesses.where(status: 'active')
  end
  scope :inactive do |businesses|
    businesses.where(status: 'inactive')
  end

  index do
    selectable_column
    id_column
    column :name
    column :industry
    column :status
    column :tenant
    column :owner do |business|
      business.owner&.full_name
    end
    column :locations_count do |business|
      business.locations.count
    end
    column :services_count do |business|
      business.services.count
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :slug
      row :description
      row :industry
      row :status
      row :tenant
      row :owner do |business|
        business.owner&.full_name
      end
      row :phone
      row :email
      row :website
      row :timezone
      row :currency
      row :booking_lead_time_minutes
      row :booking_window_days
      row :cancellation_policy_hours
      row :deposit_percentage
      row :created_at
      row :updated_at
    end

    panel "Locations" do
      table_for business.locations do
        column :name
        column :city
        column :is_primary
        column :is_virtual
        column :status
      end
    end

    panel "Services" do
      table_for business.services do
        column :name
        column :duration_minutes
        column :price_cents do |service|
          number_to_currency(service.price_cents / 100.0) if service.price_cents
        end
        column :is_public
        column :status
      end
    end

    panel "Staff Members" do
      table_for business.staff_members do
        column :user do |staff|
          staff.user&.full_name
        end
        column :title
        column :role
        column :is_bookable
        column :status
      end
    end

    panel "Recent Bookings" do
      table_for business.bookings.order(created_at: :desc).limit(10) do
        column :confirmation_code
        column :client do |booking|
          booking.client&.full_name
        end
        column :service do |booking|
          booking.service&.name
        end
        column :start_at
        column :status
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :tenant
      f.input :owner, as: :select, collection: User.all.map { |u| [u.full_name, u.id] }
      f.input :name
      f.input :slug
      f.input :description
      f.input :industry, as: :select, collection: %w[healthcare beauty fitness wellness home_services professional_services education other]
      f.input :status, as: :select, collection: %w[active inactive suspended]
      f.input :phone
      f.input :email
      f.input :website
      f.input :timezone, as: :select, collection: ActiveSupport::TimeZone.all.map(&:name)
      f.input :currency, as: :select, collection: %w[USD EUR GBP INR CAD AUD]
      f.input :booking_lead_time_minutes
      f.input :booking_window_days
      f.input :cancellation_policy_hours
      f.input :deposit_percentage
    end
    f.actions
  end
end
