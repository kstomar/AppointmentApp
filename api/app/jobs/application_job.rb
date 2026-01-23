class ApplicationJob < ActiveJob::Base
  queue_as :default

  retry_on StandardError, wait: :polynomially_longer, attempts: 5
  retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3
  discard_on ActiveJob::DeserializationError

  around_perform do |job, block|
    tenant_id = job.arguments.first.is_a?(Hash) ? job.arguments.first[:tenant_id] : nil
    
    if tenant_id
      tenant = Tenant.find_by(id: tenant_id)
      ActsAsTenant.with_tenant(tenant) { block.call }
    else
      block.call
    end
  end
end
