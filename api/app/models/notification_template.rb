class NotificationTemplate < ApplicationRecord
  TEMPLATE_TYPES = %w[
    booking_confirmation booking_reminder booking_cancelled booking_rescheduled
    booking_completed payment_received payment_failed refund_processed
    waitlist_available review_request staff_assignment time_off_approved
    time_off_rejected welcome password_reset
  ].freeze
  CHANNELS = %w[email sms push].freeze

  belongs_to :tenant, optional: true
  belongs_to :business, optional: true

  validates :name, presence: true, length: { maximum: 255 }
  validates :template_type, presence: true, inclusion: { in: TEMPLATE_TYPES }
  validates :channel, presence: true, inclusion: { in: CHANNELS }
  validates :body, presence: true
  validates :subject, presence: true, if: :email?
  validates :template_type, uniqueness: { scope: [:business_id, :channel, :locale] }

  scope :active, -> { where(is_active: true) }
  scope :system_templates, -> { where(is_system: true) }
  scope :custom_templates, -> { where(is_system: false) }
  scope :by_type, ->(type) { where(template_type: type) }
  scope :by_channel, ->(channel) { where(channel: channel) }
  scope :by_locale, ->(locale) { where(locale: locale) }

  def email?
    channel == 'email'
  end

  def sms?
    channel == 'sms'
  end

  def push?
    channel == 'push'
  end

  def render(variables = {})
    rendered_body = body.dup
    rendered_subject = subject&.dup

    variables.each do |key, value|
      placeholder = "{{#{key}}}"
      rendered_body.gsub!(placeholder, value.to_s)
      rendered_subject&.gsub!(placeholder, value.to_s)
    end

    { subject: rendered_subject, body: rendered_body }
  end

  def available_variables
    variables || []
  end

  def self.find_template(business:, template_type:, channel:, locale: 'en')
    where(business: business, template_type: template_type, channel: channel, locale: locale, is_active: true).first ||
      where(business: business, template_type: template_type, channel: channel, locale: 'en', is_active: true).first ||
      system_templates.where(template_type: template_type, channel: channel, locale: locale, is_active: true).first ||
      system_templates.where(template_type: template_type, channel: channel, locale: 'en', is_active: true).first
  end
end
