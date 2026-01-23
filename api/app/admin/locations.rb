ActiveAdmin.register Location do
  menu parent: "Businesses", priority: 1

  permit_params :business_id, :name, :address_line1, :address_line2, :city, :state,
                :postal_code, :country, :latitude, :longitude, :phone, :email,
                :timezone, :is_primary, :is_virtual, :virtual_meeting_url, :status,
                :operating_hours

  filter :name
  filter :business
  filter :city
  filter :state
  filter :country
  filter :is_primary
  filter :is_virtual
  filter :status
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :business
    column :city
    column :state
    column :is_primary
    column :is_virtual
    column :status
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :business
      row :address_line1
      row :address_line2
      row :city
      row :state
      row :postal_code
      row :country
      row :latitude
      row :longitude
      row :phone
      row :email
      row :timezone
      row :is_primary
      row :is_virtual
      row :virtual_meeting_url
      row :status
      row :operating_hours
      row :created_at
      row :updated_at
    end

    panel "Staff Members" do
      table_for location.staff_members do
        column :user do |staff|
          staff.user&.full_name
        end
        column :title
        column :is_bookable
        column :status
      end
    end

    panel "Recent Bookings" do
      table_for location.bookings.order(created_at: :desc).limit(10) do
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
      f.input :business
      f.input :name
      f.input :address_line1
      f.input :address_line2
      f.input :city
      f.input :state
      f.input :postal_code
      f.input :country, as: :select, collection: ISO3166::Country.all.map { |c| [c.common_name, c.alpha2] }
      f.input :latitude
      f.input :longitude
      f.input :phone
      f.input :email
      f.input :timezone, as: :select, collection: ActiveSupport::TimeZone.all.map(&:name)
      f.input :is_primary
      f.input :is_virtual
      f.input :virtual_meeting_url
      f.input :status, as: :select, collection: %w[active inactive temporarily_closed]
    end
    f.actions
  end
end
