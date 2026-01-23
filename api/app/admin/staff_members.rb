ActiveAdmin.register StaffMember do
  menu parent: "Businesses", priority: 3

  permit_params :business_id, :user_id, :location_id, :title, :bio, :status,
                :role, :is_bookable, :accepts_new_clients, :max_daily_bookings,
                :skills, :settings

  filter :business
  filter :user
  filter :location
  filter :role
  filter :status
  filter :is_bookable
  filter :created_at

  index do
    selectable_column
    id_column
    column :user do |staff|
      staff.user&.full_name
    end
    column :business
    column :title
    column :role
    column :is_bookable
    column :status
    actions
  end

  show do
    attributes_table do
      row :id
      row :user do |staff|
        staff.user&.full_name
      end
      row :business
      row :location
      row :title
      row :bio
      row :role
      row :status
      row :is_bookable
      row :accepts_new_clients
      row :max_daily_bookings
      row :skills
      row :created_at
      row :updated_at
    end

    panel "Services" do
      table_for staff_member.services do
        column :name
        column :duration_minutes
        column :price_cents do |service|
          number_to_currency(service.price_cents / 100.0) if service.price_cents
        end
      end
    end

    panel "Upcoming Bookings" do
      table_for staff_member.bookings.where('start_at >= ?', Time.current).order(start_at: :asc).limit(10) do
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

    panel "Availability Rules" do
      table_for staff_member.availability_rules do
        column :day_of_week
        column :start_time
        column :end_time
        column :is_available
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :business
      f.input :user, as: :select, collection: User.all.map { |u| [u.full_name, u.id] }
      f.input :location
      f.input :title
      f.input :bio
      f.input :role, as: :select, collection: %w[owner manager provider assistant]
      f.input :status, as: :select, collection: %w[active inactive on_leave terminated]
      f.input :is_bookable
      f.input :accepts_new_clients
      f.input :max_daily_bookings
    end
    f.actions
  end
end
