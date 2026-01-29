module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_user!, only: [:sign_up, :sign_in, :sign_up_business, :sign_up_client, :forgot_password, :reset_password]
      skip_before_action :set_tenant, only: [:sign_up, :sign_up_business, :sign_up_client]

      # Legacy sign_up endpoint
      def sign_up
        tenant = find_or_create_tenant
        
        ActsAsTenant.with_tenant(tenant) do
          user = User.new(sign_up_params.merge(tenant: tenant))
          
          if user.save
            log_audit(action: 'create', auditable: user)
            token = generate_jwt_token(user)
            render_created({ user: user_response(user), token: token }, message: 'Account created successfully')
          else
            render_validation_errors(user)
          end
        end
      end

      # Business Owner Registration - creates tenant, business, and admin user
      def sign_up_business
        ActiveRecord::Base.transaction do
          # Create tenant
          tenant = Tenant.create!(
            name: params[:business_name],
            subdomain: params[:subdomain]&.downcase&.strip,
            industry: params[:industry] || 'other',
            status: 'active',
            plan: 'trial'
          )

          ActsAsTenant.with_tenant(tenant) do
            # Create business owner user
            user = User.new(
              email: params[:email]&.downcase&.strip,
              password: params[:password],
              password_confirmation: params[:password_confirmation],
              first_name: params[:first_name],
              last_name: params[:last_name],
              phone: params[:phone],
              timezone: params[:timezone] || 'UTC',
              role: 'business_admin',
              status: 'active',
              tenant: tenant
            )

            unless user.save
              raise ActiveRecord::Rollback
              return render_validation_errors(user)
            end

            # Create business
            business = Business.create!(
              name: params[:business_name],
              slug: params[:subdomain]&.downcase&.strip,
              industry: params[:industry] || 'other',
              email: params[:email],
              phone: params[:phone],
              status: 'active',
              owner: user,
              tenant: tenant,
              settings: {
                booking_window_days: 30,
                min_booking_notice_hours: 1,
                max_bookings_per_slot: 1,
                allow_cancellation: true,
                cancellation_notice_hours: 24
              }
            )

            log_audit(action: 'create', auditable: user)
            log_audit(action: 'create', auditable: business)
            
            token = generate_jwt_token(user)
            render_created({
              user: user_response(user),
              business: business_response(business),
              tenant: tenant_response(tenant),
              token: token
            }, message: 'Business account created successfully')
          end
        end
      rescue ActiveRecord::RecordInvalid => e
        render_error(e.record.errors.full_messages.join(', '), status: :unprocessable_entity)
      end

      # Client Registration - registers a client to book appointments
      def sign_up_client
        # For clients, we use a default public tenant or find by subdomain
        tenant = if params[:subdomain].present?
          Tenant.find_by!(subdomain: params[:subdomain]&.downcase)
        else
                    Tenant.find_or_create_by!(subdomain: 'public') do |t|
                      t.name = 'Public'
                      t.industry = 'other'
                      t.status = 'active'
                      t.plan = 'free'
                    end
        end

        ActsAsTenant.with_tenant(tenant) do
          user = User.new(
            email: params[:email]&.downcase&.strip,
            password: params[:password],
            password_confirmation: params[:password_confirmation],
            first_name: params[:first_name],
            last_name: params[:last_name],
            phone: params[:phone],
            timezone: params[:timezone] || 'UTC',
            role: 'client',
            status: 'active',
            tenant: tenant
          )

          if user.save
            log_audit(action: 'create', auditable: user)
            token = generate_jwt_token(user)
            render_created({ user: user_response(user), token: token }, message: 'Client account created successfully')
          else
            render_validation_errors(user)
          end
        end
      rescue ActiveRecord::RecordNotFound
        render_error('Business not found', status: :not_found)
      end

      def sign_in
        user = User.find_by(email: params[:email]&.downcase)
        
        if user&.valid_password?(params[:password])
          if user.active?
            log_audit(action: 'login', auditable: user)
            token = generate_jwt_token(user)
            render_success({ user: user_response(user), token: token }, message: 'Signed in successfully')
          else
            render_error('Your account has been deactivated', status: :forbidden)
          end
        else
          render_error('Invalid email or password', status: :unauthorized)
        end
      end

      def sign_out
        if current_user
          log_audit(action: 'logout', auditable: current_user)
          render_success(message: 'Signed out successfully')
        else
          render_unauthorized
        end
      end

      def me
        render_success(user_response(current_user))
      end

      def update_profile
        if current_user.update(profile_params)
          log_audit(action: 'update', auditable: current_user, changes: current_user.previous_changes)
          render_success(user_response(current_user), message: 'Profile updated successfully')
        else
          render_validation_errors(current_user)
        end
      end

      def change_password
        unless current_user.valid_password?(params[:current_password])
          return render_error('Current password is incorrect', status: :unprocessable_entity)
        end

        if current_user.update(password: params[:new_password], password_confirmation: params[:new_password_confirmation])
          render_success(message: 'Password changed successfully')
        else
          render_validation_errors(current_user)
        end
      end

      def forgot_password
        user = User.find_by(email: params[:email]&.downcase)
        
        if user
          user.send_reset_password_instructions
        end

        render_success(message: 'If your email exists in our system, you will receive password reset instructions')
      end

      def reset_password
        user = User.reset_password_by_token(
          reset_password_token: params[:token],
          password: params[:password],
          password_confirmation: params[:password_confirmation]
        )

        if user.errors.empty?
          render_success(message: 'Password has been reset successfully')
        else
          render_validation_errors(user)
        end
      end

      private

      def skip_authorization?
        true
      end

      def sign_up_params
        params.permit(:email, :password, :password_confirmation, :first_name, :last_name, :phone, :timezone)
      end

      def profile_params
        params.permit(:first_name, :last_name, :phone, :timezone, :locale, :avatar_url, preferences: {})
      end

            def find_or_create_tenant
              if params[:tenant_id].present?
                Tenant.find(params[:tenant_id])
              elsif params[:subdomain].present?
                Tenant.find_or_create_by!(subdomain: params[:subdomain]) do |t|
                  t.name = params[:business_name] || params[:subdomain].titleize
                  t.industry = params[:industry] || 'other'
                  t.status = 'active'
                  t.plan = 'trial'
                end
              else
                raise ActionController::ParameterMissing, :subdomain
              end
            end

      def generate_jwt_token(user)
        Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
      end

      def user_response(user)
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          timezone: user.timezone,
          locale: user.locale,
          avatar_url: user.avatar_url,
          preferences: user.preferences,
          tenant_id: user.tenant_id
        }
      end

      def business_response(business)
        {
          id: business.id,
          name: business.name,
          slug: business.slug,
          industry: business.industry,
          email: business.email,
          phone: business.phone,
          status: business.status
        }
      end

      def tenant_response(tenant)
        {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          industry: tenant.industry,
          plan: tenant.plan
        }
      end
    end
  end
end
