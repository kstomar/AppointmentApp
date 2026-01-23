class IntakeForm < ApplicationRecord
  include Tenantable

  STATUSES = %w[active inactive archived].freeze
  FIELD_TYPES = %w[text textarea number email phone date select multi_select checkbox radio file signature].freeze

  belongs_to :tenant
  belongs_to :business
  belongs_to :service, optional: true
  has_many :intake_form_responses, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :valid_fields_structure

  scope :active, -> { where(status: 'active') }
  scope :required, -> { where(is_required: true) }
  scope :for_service, ->(service_id) { where(service_id: service_id) }
  scope :general, -> { where(service_id: nil) }

  def active?
    status == 'active'
  end

  def field_count
    fields&.length || 0
  end

  def required_fields
    (fields || []).select { |f| f['required'] == true }
  end

  def field_by_id(field_id)
    (fields || []).find { |f| f['id'] == field_id }
  end

  def add_field(field_config)
    field = {
      'id' => SecureRandom.uuid,
      'type' => field_config[:type],
      'label' => field_config[:label],
      'required' => field_config[:required] || false,
      'placeholder' => field_config[:placeholder],
      'options' => field_config[:options],
      'validation' => field_config[:validation],
      'conditional' => field_config[:conditional]
    }.compact

    self.fields = (fields || []) + [field]
    field
  end

  def remove_field(field_id)
    self.fields = (fields || []).reject { |f| f['id'] == field_id }
  end

  def update_field(field_id, updates)
    self.fields = (fields || []).map do |f|
      f['id'] == field_id ? f.merge(updates.stringify_keys) : f
    end
  end

  def validate_response(responses)
    errors = []
    
    required_fields.each do |field|
      value = responses[field['id']]
      if value.blank?
        errors << { field_id: field['id'], message: "#{field['label']} is required" }
      end
    end

    (fields || []).each do |field|
      value = responses[field['id']]
      next if value.blank?

      case field['type']
      when 'email'
        unless value.match?(URI::MailTo::EMAIL_REGEXP)
          errors << { field_id: field['id'], message: "#{field['label']} must be a valid email" }
        end
      when 'phone'
        unless Phonelib.valid?(value)
          errors << { field_id: field['id'], message: "#{field['label']} must be a valid phone number" }
        end
      end
    end

    errors
  end

  private

  def valid_fields_structure
    return if fields.blank?
    
    unless fields.is_a?(Array)
      errors.add(:fields, 'must be an array')
      return
    end

    fields.each_with_index do |field, index|
      unless field.is_a?(Hash)
        errors.add(:fields, "field at index #{index} must be an object")
        next
      end

      unless field['type'].present? && FIELD_TYPES.include?(field['type'])
        errors.add(:fields, "field at index #{index} has invalid type")
      end

      unless field['label'].present?
        errors.add(:fields, "field at index #{index} must have a label")
      end
    end
  end
end
