Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    cors_origins = ENV.fetch('CORS_ORIGINS', 'http://localhost:3000')
    
    if cors_origins == '*'
      origins '*'
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        expose: ['Authorization', 'X-Request-Id'],
        max_age: 86400
    else
      origins cors_origins.split(',')
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        expose: ['Authorization', 'X-Request-Id'],
        credentials: true,
        max_age: 86400
    end
  end
end
