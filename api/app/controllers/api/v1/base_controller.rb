module Api
  module V1
    class BaseController < ApplicationController
      include Pundit::Authorization

      before_action :authenticate_user!

      after_action :verify_authorized, unless: :skip_authorization?, if: -> { action_exists? && action_name != 'index' }
      after_action :verify_policy_scoped, unless: :skip_authorization?, if: -> { action_name == 'index' && index_action_exists? }

      private

      def skip_authorization?
        false
      end

      def action_exists?
        respond_to?(action_name, true)
      end

      def index_action_exists?
        respond_to?(:index, true)
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
