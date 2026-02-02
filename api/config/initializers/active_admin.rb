# ActiveAdmin is disabled for API-only mode
# To enable ActiveAdmin, set config.api_only = false in config/application.rb
# and uncomment the routes in config/routes.rb
#
# ActiveAdmin.setup do |config|
#   config.site_title = "Appointment Platform Admin"
#   config.authentication_method = :authenticate_admin_user!
#   config.current_user_method = :current_admin_user
#   config.logout_link_path = :destroy_admin_user_session_path
#   config.root_to = 'dashboard#index'
#   config.batch_actions = true
#   config.filter_attributes = [:encrypted_password, :password, :password_confirmation]
#   config.localize_format = :long
#   config.include_default_association_filters = true
#   config.comments = true
#   config.comments_registration_name = 'AdminComment'
#   config.namespace :admin do |admin|
#     admin.build_menu do |menu|
#       menu.add label: "Dashboard", priority: 1
#       menu.add label: "Businesses", priority: 2
#       menu.add label: "Bookings", priority: 3
#       menu.add label: "Users", priority: 4
#       menu.add label: "Payments", priority: 5
#       menu.add label: "Settings", priority: 10
#     end
#   end
# end
