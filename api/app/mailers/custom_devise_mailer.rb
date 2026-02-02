class CustomDeviseMailer < Devise::Mailer
  helper :application
  include Devise::Controllers::UrlHelpers
  default template_path: 'devise/mailer'

  def confirmation_instructions(record, token, opts = {})
    @token = token
    @resource = record
    @frontend_url = build_frontend_url('confirm-email', confirmation_token: token)
    
    opts[:subject] = "Confirm your email address"
    opts[:to] = record.email
    opts[:from] = ENV.fetch('MAILER_FROM_ADDRESS', 'noreply@example.com')
    
    mail(opts) do |format|
      format.html { render 'custom_devise_mailer/confirmation_instructions' }
      format.text { render 'custom_devise_mailer/confirmation_instructions' }
    end
  end

  def reset_password_instructions(record, token, opts = {})
    @token = token
    @resource = record
    @frontend_url = build_frontend_url('reset-password', reset_password_token: token)
    
    opts[:subject] = "Reset your password"
    opts[:to] = record.email
    opts[:from] = ENV.fetch('MAILER_FROM_ADDRESS', 'noreply@example.com')
    
    mail(opts) do |format|
      format.html { render 'custom_devise_mailer/reset_password_instructions' }
      format.text { render 'custom_devise_mailer/reset_password_instructions' }
    end
  end

  def unlock_instructions(record, token, opts = {})
    @token = token
    @resource = record
    @frontend_url = build_frontend_url('unlock-account', unlock_token: token)
    
    opts[:subject] = "Unlock your account"
    opts[:to] = record.email
    opts[:from] = ENV.fetch('MAILER_FROM_ADDRESS', 'noreply@example.com')
    
    mail(opts) do |format|
      format.html { render 'custom_devise_mailer/unlock_instructions' }
      format.text { render 'custom_devise_mailer/unlock_instructions' }
    end
  end

  private

  def build_frontend_url(path, params = {})
    base_url = ENV.fetch('FRONTEND_URL', 'http://localhost:5173')
    query_string = params.map { |k, v| "#{k}=#{v}" }.join('&')
    "#{base_url}/#{path}?#{query_string}"
  end
end
