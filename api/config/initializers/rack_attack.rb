class Rack::Attack
  Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/1'))

  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?('/assets')
  end

  throttle('logins/ip', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/sign_in' && req.post?
      req.ip
    end
  end

  throttle('logins/email', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/sign_in' && req.post?
      req.params['email'].to_s.downcase.gsub(/\s+/, '')
    end
  end

  throttle('signup/ip', limit: 3, period: 1.minute) do |req|
    if req.path == '/api/v1/auth/sign_up' && req.post?
      req.ip
    end
  end

  throttle('password_reset/ip', limit: 5, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/password' && req.post?
      req.ip
    end
  end

  throttle('api/ip', limit: 100, period: 1.minute) do |req|
    if req.path.start_with?('/api/')
      req.ip
    end
  end

  blocklist('block bad IPs') do |req|
    Rack::Attack::Fail2Ban.filter("pentesters-#{req.ip}", maxretry: 3, findtime: 10.minutes, bantime: 1.hour) do
      CGI.unescape(req.query_string) =~ %r{/etc/passwd} ||
      req.path.include?('/etc/passwd') ||
      req.path.include?('wp-admin') ||
      req.path.include?('wp-login')
    end
  end

  self.throttled_responder = lambda do |env|
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      { 'Content-Type' => 'application/json', 'Retry-After' => retry_after.to_s },
      [{ error: 'Rate limit exceeded. Please retry later.', retry_after: retry_after }.to_json]
    ]
  end
end
