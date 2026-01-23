module Api
  module V1
    class BaseController < ApplicationController
      include Pundit::Authorization

      before_action :authenticate_user!
      before_action :set_tenant

      after_action :verify_authorized, except: :index, unless: :skip_authorization?
      after_action :verify_policy_scoped, only: :index, unless: :skip_authorization?

      private

      def set_tenant
        @current_tenant = ActsAsTenant.current_tenant
      end

      def current_tenant
        @current_tenant
      end

      def skip_authorization?
        false
      end

      def pundit_user
        current_user
      end

      def log_audit(action:, auditable: nil, changes: {}, metadata: {})
        AuditLog.log(
          action: action,
          auditable: auditable,
          user: current_user,
          changes: changes,
          metadata: metadata,
          request: request
        )
      end
    end
  end
end
