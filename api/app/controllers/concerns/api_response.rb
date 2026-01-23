module ApiResponse
  extend ActiveSupport::Concern

  def render_success(data = nil, message: nil, status: :ok, meta: {})
    response = { success: true }
    response[:message] = message if message.present?
    response[:data] = data if data.present?
    response[:meta] = meta if meta.present?
    
    render json: response, status: status
  end

  def render_created(data = nil, message: 'Created successfully')
    render_success(data, message: message, status: :created)
  end

  def render_error(message, status: :unprocessable_entity, errors: [])
    response = {
      success: false,
      error: message
    }
    response[:errors] = errors if errors.present?
    
    render json: response, status: status
  end

  def render_not_found(message = 'Resource not found')
    render_error(message, status: :not_found)
  end

  def render_unauthorized(message = 'Unauthorized')
    render_error(message, status: :unauthorized)
  end

  def render_forbidden(message = 'Forbidden')
    render_error(message, status: :forbidden)
  end

  def render_validation_errors(record)
    render_error(
      'Validation failed',
      status: :unprocessable_entity,
      errors: record.errors.full_messages
    )
  end

  def render_paginated(collection, serializer: nil)
    data = if serializer
             collection.map { |item| serializer.new(item).as_json }
           else
             collection
           end

    render_success(data, meta: pagination_meta(collection))
  end

  private

  def pagination_meta(collection)
    return {} unless collection.respond_to?(:current_page)

    {
      current_page: collection.current_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count,
      per_page: collection.limit_value
    }
  end
end
