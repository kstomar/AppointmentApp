module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_user_from_jwt!, only: [:sign_up, :sign_in, :sign_up_business, :sign_up_client, :forgot_password, :reset_password, :confirm_email, :resend_confirmation, :unlock_account]

      # Legacy sign_up endpoint
      def sign_up
        user = User.new(sign_up_params)
        
        if user.save
          log_audit(action: 'create', auditable: user)
          token = generate_jwt_token(user)
          render_created({ user: user_response(user), token: token }, message: 'Account created successfully')
        else
          render_validation_errors(user)
        end
      end

      # Business Owner Registration - creates business and admin user
      def sign_up_business
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
          status: 'active'
        )

        unless user.save
          return render_validation_errors(user)
        end

        # Create business
        business = Business.create!(
          name: params[:business_name],
          slug: params[:business_name]&.parameterize,
          industry: params[:industry] || 'other',
          email: params[:email],
          phone: params[:phone],
          timezone: params[:timezone] || 'UTC',
          status: 'active',
          owner: user,
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
          token: token
        }, message: 'Business account created successfully')
      rescue ActiveRecord::RecordInvalid => e
        render_error(e.record.errors.full_messages.join(', '), status: :unprocessable_entity)
      end

      # Client Registration - registers a client to book appointments
      def sign_up_client
        user = User.new(
          email: params[:email]&.downcase&.strip,
          password: params[:password],
          password_confirmation: params[:password_confirmation],
          first_name: params[:first_name],
          last_name: params[:last_name],
          phone: params[:phone],
          timezone: params[:timezone] || 'UTC',
          role: 'client',
          status: 'active'
        )

        if user.save
          log_audit(action: 'create', auditable: user)
          token = generate_jwt_token(user)
          render_created({ user: user_response(user), token: token }, message: 'Client account created successfully')
        else
          render_validation_errors(user)
        end
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

      def confirm_email
        user = User.confirm_by_token(params[:confirmation_token])

        if user.errors.empty?
          log_audit(action: 'confirm_email', auditable: user)
          render_success(message: 'Email confirmed successfully')
        else
          render_error(user.errors.full_messages.join(', '), status: :unprocessable_entity)
        end
      end

      def resend_confirmation
        user = User.find_by(email: params[:email]&.downcase)

        if user && !user.confirmed?
          user.send_confirmation_instructions
          render_success(message: 'Confirmation instructions sent')
        elsif user&.confirmed?
          render_error('Email is already confirmed', status: :unprocessable_entity)
        else
          render_success(message: 'If your email exists in our system, you will receive confirmation instructions')
        end
      end

      def unlock_account
        user = User.unlock_access_by_token(params[:unlock_token])

        if user.errors.empty?
          log_audit(action: 'unlock_account', auditable: user)
          render_success(message: 'Account unlocked successfully')
        else
          render_error(user.errors.full_messages.join(', '), status: :unprocessable_entity)
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
          preferences: user.preferences
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
    end
  end
end
