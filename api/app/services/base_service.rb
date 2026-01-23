class BaseService
  include ActiveModel::Validations

  attr_reader :result, :errors_list

  def self.call(*args, **kwargs, &block)
    new(*args, **kwargs, &block).call
  end

  def initialize
    @errors_list = []
    @result = nil
  end

  def call
    raise NotImplementedError, "#{self.class}#call must be implemented"
  end

  def success?
    @errors_list.empty? && errors.empty?
  end

  def failure?
    !success?
  end

  protected

  def add_error(message, field: :base)
    @errors_list << { field: field, message: message }
    errors.add(field, message)
  end

  def set_result(value)
    @result = value
  end

  def current_tenant
    ActsAsTenant.current_tenant
  end
end
