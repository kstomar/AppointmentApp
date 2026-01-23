class ApplicationController < ActionController::API
  include ApiResponse
  include ExceptionHandler

  before_action :set_request_id

  private

  def set_request_id
    Thread.current[:request_id] = request.request_id
  end
end
