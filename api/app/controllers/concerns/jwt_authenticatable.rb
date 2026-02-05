module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user_from_jwt!
  end

  private

  def authenticate_user_from_jwt!
    token = extract_token_from_header
    
    if token.blank?
      Rails.logger.debug "JWT Auth: No token found in Authorization header"
      render_unauthorized('Missing authentication token')
      return
    end

    begin
      # Use Warden::JWTAuth::TokenDecoder to ensure we use the same secret
      # that was used to encode the token (configured in devise.rb)
      payload = decode_jwt_token(token)
      
      if payload.nil?
        render_unauthorized('Invalid authentication token')
        return
      end

      Rails.logger.debug "JWT Auth: Decoded payload - sub: #{payload['sub']}, jti: #{payload['jti']}"

      user = find_user_from_payload(payload)
      
      if user.nil?
        Rails.logger.warn "JWT Auth: User not found for sub: #{payload['sub']}"
        render_unauthorized('User not found')
        return
      end

      if token_revoked?(payload)
        Rails.logger.warn "JWT Auth: Token revoked for jti: #{payload['jti']}"
        render_unauthorized('Token has been revoked')
        return
      end

      @current_user = user
      Rails.logger.debug "JWT Auth: Successfully authenticated user #{user.id}"
    rescue JWT::ExpiredSignature => e
      Rails.logger.warn "JWT Auth: Token expired - #{e.message}"
      render_unauthorized('Token has expired')
    rescue JWT::DecodeError => e
      Rails.logger.error "JWT Auth: Decode error - #{e.class}: #{e.message}"
      render_unauthorized('Invalid authentication token')
    rescue StandardError => e
      Rails.logger.error "JWT Auth: Unexpected error - #{e.class}: #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")
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
    # Use Warden::JWTAuth::TokenDecoder which uses the same secret
    # configured in Devise.jwt.secret (from devise.rb initializer)
    # This ensures we decode with the exact same secret used to encode
    Warden::JWTAuth::TokenDecoder.new.call(token)
  rescue JWT::ExpiredSignature
    # Re-raise so we can handle it specifically in authenticate_user_from_jwt!
    raise
  rescue JWT::DecodeError => e
    Rails.logger.error "JWT decode failed: #{e.class}: #{e.message}"
    raise
  end

  def find_user_from_payload(payload)
    # devise-jwt stores user id in 'sub' claim
    user_id = payload['sub']
    return nil unless user_id.present?

    User.kept.find_by(id: user_id)
  end

  def token_revoked?(payload)
    jti = payload['jti']
    return true unless jti.present?

    JwtDenylist.exists?(jti: jti)
  end
end
