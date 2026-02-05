module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user_from_jwt!
  end

  private

  def authenticate_user_from_jwt!
    token = extract_token_from_header
    
    if token.blank?
      render_unauthorized('Missing authentication token')
      return
    end

    begin
      payload = decode_jwt_token(token)
      
      if payload.nil?
        render_unauthorized('Invalid authentication token')
        return
      end

      user = find_user_from_payload(payload)
      
      if user.nil?
        render_unauthorized('User not found')
        return
      end

      if token_revoked?(payload)
        render_unauthorized('Token has been revoked')
        return
      end

      if token_expired?(payload)
        render_unauthorized('Token has expired')
        return
      end

      @current_user = user
    rescue JWT::DecodeError => e
      Rails.logger.error "JWT decode error: #{e.message}"
      render_unauthorized('Invalid authentication token')
    rescue StandardError => e
      Rails.logger.error "Authentication error: #{e.message}"
      render_unauthorized('Authentication failed')
    end
  end

  def current_user
    @current_user
  end

  def user_signed_in?
    current_user.present?
  end

  def extract_token_from_header
    auth_header = request.headers['Authorization']
    return nil unless auth_header.present?

    # Extract token from "Bearer <token>" format
    match = auth_header.match(/^Bearer\s+(.+)$/i)
    match&.[](1)
  end

  def decode_jwt_token(token)
    secret = jwt_secret
    
    decoded = JWT.decode(
      token,
      secret,
      true,
      {
        algorithm: 'HS256',
        verify_jti: false  # We'll verify JTI manually against denylist
      }
    )
    
    decoded.first
  rescue JWT::ExpiredSignature
    nil
  rescue JWT::DecodeError
    nil
  end

  def find_user_from_payload(payload)
    # devise-jwt stores user info in 'sub' claim
    user_id = payload['sub']
    return nil unless user_id.present?

    User.kept.find_by(id: user_id)
  end

  def token_revoked?(payload)
    jti = payload['jti']
    return true unless jti.present?

    JwtDenylist.exists?(jti: jti)
  end

  def token_expired?(payload)
    exp = payload['exp']
    return true unless exp.present?

    Time.at(exp) < Time.current
  end

  def jwt_secret
    ENV.fetch('DEVISE_JWT_SECRET_KEY') { 
      Rails.application.credentials.devise_jwt_secret_key || 
      Rails.application.secret_key_base 
    }
  end
end
