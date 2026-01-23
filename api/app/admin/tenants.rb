ActiveAdmin.register Tenant do
  menu parent: "Settings", priority: 1

  permit_params :name, :subdomain, :domain, :status, :plan, :settings, :features

  filter :name
  filter :subdomain
  filter :domain
  filter :status
  filter :plan
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :subdomain
    column :domain
    column :status
    column :plan
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :subdomain
      row :domain
      row :status
      row :plan
      row :settings
      row :features
      row :created_at
      row :updated_at
    end

    panel "Businesses" do
      table_for tenant.businesses do
        column :name
        column :industry
        column :status
        column :created_at
      end
    end

    panel "Users" do
      table_for tenant.users.limit(20) do
        column :email
        column :full_name
        column :role
        column :created_at
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :name
      f.input :subdomain
      f.input :domain
      f.input :status, as: :select, collection: %w[active suspended cancelled]
      f.input :plan, as: :select, collection: %w[free starter professional enterprise]
    end
    f.actions
  end
end
