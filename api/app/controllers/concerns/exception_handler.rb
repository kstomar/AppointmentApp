module ExceptionHandler
  extend ActiveSupport::Concern

  included do
    rescue_from StandardError, with: :handle_standard_error
    rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
    rescue_from ActiveRecord::RecordInvalid, with: :handle_validation_error
    rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing
    rescue_from Pundit::NotAuthorizedError, with: :handle_unauthorized
  end

  private

  def handle_standard_error(exception)
    Rails.logger.error "#{exception.class}: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")

    if Rails.env.production?
      render_error('An unexpected error occurred', status: :internal_server_error)
    else
      render_error(exception.message, status: :internal_server_error, errors: [exception.class.to_s])
    end
  end

  def handle_not_found(exception)
    render_not_found(exception.message)
  end

  def handle_validation_error(exception)
    render_validation_errors(exception.record)
  end

  def handle_parameter_missing(exception)
    render_error("Missing parameter: #{exception.param}", status: :bad_request)
  end

  def handle_unauthorized(exception)
    render_forbidden("You are not authorized to perform this action")
  end
end
