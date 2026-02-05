Rails.application.routes.draw do
  # ActiveAdmin
  # devise_for :admin_users, ActiveAdmin::Devise.config
  # ActiveAdmin.routes(self)

  # Devise mapping for User model (routes skipped, using custom auth endpoints)
  devise_for :users, skip: :all

  get "up" => "rails/health#show", as: :rails_health_check
  get "health" => "rails/health#show"

  namespace :api do
    namespace :v1 do
            # Authentication
            post 'auth/sign_up', to: 'auth#sign_up'
            post 'auth/sign_up/business', to: 'auth#sign_up_business'
            post 'auth/sign_up/client', to: 'auth#sign_up_client'
            post 'auth/sign_in', to: 'auth#sign_in'
            delete 'auth/sign_out', to: 'auth#sign_out'
            get 'auth/me', to: 'auth#me'
            patch 'auth/profile', to: 'auth#update_profile'
            post 'auth/change_password', to: 'auth#change_password'
            post 'auth/forgot_password', to: 'auth#forgot_password'
            post 'auth/reset_password', to: 'auth#reset_password'
            post 'auth/confirm_email', to: 'auth#confirm_email'
            post 'auth/resend_confirmation', to: 'auth#resend_confirmation'
            post 'auth/unlock_account', to: 'auth#unlock_account'

      # Businesses and nested resources
      resources :businesses do
        resources :locations
        resources :services
        resources :staff_members do
          member do
            post :assign_services
          end
        end
        get 'availability', to: 'availability#index'
      end

      # Clients
      resources :clients, only: [:index, :show, :create, :update, :destroy]

      # Reports
      get 'reports/dashboard', to: 'reports#dashboard'
      get 'reports/bookings', to: 'reports#bookings'
      get 'reports/revenue', to: 'reports#revenue'
      get 'reports/staff_performance', to: 'reports#staff_performance'

      # Bookings
      resources :bookings do
        member do
          post :cancel
          post :complete
          post :no_show
          post :reschedule
        end
        collection do
          get :upcoming
          get :past
        end
      end

      # Payments
      resources :payments, only: [:index, :show] do
        member do
          post :refund
        end
        collection do
          post :confirm
        end
      end
      post 'bookings/:booking_id/payments/intent', to: 'payments#create_intent'
      post 'bookings/:booking_id/payments/checkout', to: 'payments#create_checkout'

      # Notifications
      resources :notifications, only: [:index, :show] do
        member do
          post :mark_read
        end
        collection do
          post :mark_all_read
          get :unread_count
          get :preferences
          patch :preferences, to: 'notifications#update_preferences'
        end
      end

      # Calendar Integrations
      resources :calendar_integrations, only: [:index, :show, :update, :destroy] do
        member do
          post :sync
        end
        collection do
          get :oauth_url
          get :callback
        end
      end

      # Webhooks
      post 'webhooks/stripe', to: 'webhooks#stripe'
      post 'webhooks/razorpay', to: 'webhooks#razorpay'
      post 'webhooks/google_calendar', to: 'webhooks#google_calendar'

      # Public booking endpoints (no auth required)
      namespace :public do
        get 'businesses/:business_slug/availability', to: 'bookings#availability'
        post 'businesses/:business_slug/bookings', to: 'bookings#create'
        get 'bookings/:confirmation_code', to: 'bookings#show'
        post 'bookings/:confirmation_code/cancel', to: 'bookings#cancel'
        post 'bookings/:confirmation_code/reschedule', to: 'bookings#reschedule'
      end
    end
  end

  # Sidekiq Web UI (protected in production)
  require 'sidekiq/web'
  if Rails.env.production?
    Sidekiq::Web.use Rack::Auth::Basic do |username, password|
      ActiveSupport::SecurityUtils.secure_compare(username, ENV['SIDEKIQ_USERNAME']) &
        ActiveSupport::SecurityUtils.secure_compare(password, ENV['SIDEKIQ_PASSWORD'])
    end
  end
  mount Sidekiq::Web => '/sidekiq'
end
