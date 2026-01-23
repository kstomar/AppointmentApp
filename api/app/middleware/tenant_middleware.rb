class TenantMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = ActionDispatch::Request.new(env)
    tenant = resolve_tenant(request)

    if tenant
      ActsAsTenant.with_tenant(tenant) do
        @app.call(env)
      end
    else
      if requires_tenant?(request)
        [404, { 'Content-Type' => 'application/json' }, [{ error: 'Tenant not found' }.to_json]]
      else
        @app.call(env)
      end
    end
  end

  private

  def resolve_tenant(request)
    tenant_from_header(request) ||
      tenant_from_subdomain(request) ||
      tenant_from_custom_domain(request)
  end

  def tenant_from_header(request)
    tenant_id = request.headers['X-Tenant-ID']
    return nil unless tenant_id.present?

    Tenant.find_by(id: tenant_id)
  end

  def tenant_from_subdomain(request)
    host = request.host
    return nil if host.blank?

    subdomain = extract_subdomain(host)
    return nil if subdomain.blank? || %w[www api admin].include?(subdomain)

    Tenant.find_by(subdomain: subdomain)
  end

  def tenant_from_custom_domain(request)
    host = request.host
    return nil if host.blank?

    Tenant.find_by(custom_domain: host)
  end

  def extract_subdomain(host)
    parts = host.split('.')
    return nil if parts.length < 3

    parts.first
  end

  def requires_tenant?(request)
    path = request.path
    
    !path.start_with?('/api/v1/public') &&
      !path.start_with?('/health') &&
      !path.start_with?('/api/v1/auth/sign_up') &&
      path.start_with?('/api/')
  end
end
