class RemoveTenantFunctionality < ActiveRecord::Migration[7.1]
  def change
    # Make tenant_id nullable on all tables that have it
    # This allows existing records to work while we transition away from tenants
    
    # Users
    change_column_null :users, :tenant_id, true
    
    # Businesses
    change_column_null :businesses, :tenant_id, true
    
    # Locations
    change_column_null :locations, :tenant_id, true
    
    # Services
    change_column_null :services, :tenant_id, true
    
    # Staff Members
    change_column_null :staff_members, :tenant_id, true
    
    # Bookings
    change_column_null :bookings, :tenant_id, true
    
    # Payments
    change_column_null :payments, :tenant_id, true
    
    # Notifications
    change_column_null :notifications, :tenant_id, true
    
    # Calendar Integrations
    change_column_null :calendar_integrations, :tenant_id, true
    
    # Intake Forms
    change_column_null :intake_forms, :tenant_id, true
    
    # Audit Logs
    change_column_null :audit_logs, :tenant_id, true
    
    # Update Business slug uniqueness to be global (not scoped to tenant)
    remove_index :businesses, [:tenant_id, :slug] if index_exists?(:businesses, [:tenant_id, :slug])
    add_index :businesses, :slug, unique: true unless index_exists?(:businesses, :slug, unique: true)
    
    # Update User email uniqueness to be global (not scoped to tenant)
    remove_index :users, [:tenant_id, :email] if index_exists?(:users, [:tenant_id, :email])
    add_index :users, :email, unique: true unless index_exists?(:users, :email, unique: true)
  end
end
