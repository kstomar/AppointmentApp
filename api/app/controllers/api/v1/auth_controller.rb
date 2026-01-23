module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_user!, only: [:sign_up, :sign_in, :forgot_password, :reset_password]
      skip_before_action :set_tenant, only: [:sign_up]

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
            t.industry = params[:industry] || 'general'
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
    end
  end
end
