ActiveAdmin.register User do
  menu priority: 4

  permit_params :tenant_id, :email, :first_name, :last_name, :phone, :role,
                :timezone, :locale, :avatar_url, :password, :password_confirmation

  filter :email
  filter :first_name
  filter :last_name
  filter :role
  filter :tenant
  filter :created_at

  scope :all, default: true
  scope :admins do |users|
    users.where(role: %w[super_admin business_admin])
  end
  scope :staff do |users|
    users.where(role: 'staff')
  end
  scope :clients do |users|
    users.where(role: 'client')
  end

  index do
    selectable_column
    id_column
    column :email
    column :full_name
    column :role
    column :tenant
    column :phone
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :email
      row :first_name
      row :last_name
      row :full_name
      row :phone
      row :role
      row :tenant
      row :timezone
      row :locale
      row :avatar_url
      row :created_at
      row :updated_at
    end

    if resource.role == 'client'
      panel "Bookings as Client" do
        table_for resource.client_bookings.order(created_at: :desc).limit(10) do
          column :confirmation_code
          column :service do |booking|
            booking.service&.name
          end
          column :start_at
          column :status
        end
      end
    end

    panel "Staff Memberships" do
      table_for resource.staff_members do
        column :business do |staff|
          staff.business&.name
        end
        column :title
        column :role
        column :is_bookable
        column :status
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :tenant
      f.input :email
      f.input :first_name
      f.input :last_name
      f.input :phone
      f.input :role, as: :select, collection: %w[super_admin business_admin staff front_desk client]
      f.input :timezone, as: :select, collection: ActiveSupport::TimeZone.all.map(&:name)
      f.input :locale, as: :select, collection: %w[en es fr de hi]
      f.input :avatar_url
      if f.object.new_record?
        f.input :password
        f.input :password_confirmation
      end
    end
    f.actions
  end
end
