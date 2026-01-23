class IntakeFormResponse < ApplicationRecord
  include Tenantable

  STATUSES = %w[draft submitted reviewed].freeze

  belongs_to :tenant
  belongs_to :intake_form
  belongs_to :booking, optional: true
  belongs_to :client, class_name: 'User'

  validates :status, presence: true, inclusion: { in: STATUSES }
  validate :valid_responses

  scope :draft, -> { where(status: 'draft') }
  scope :submitted, -> { where(status: 'submitted') }
  scope :reviewed, -> { where(status: 'reviewed') }
  scope :for_client, ->(client_id) { where(client_id: client_id) }

  def draft?
    status == 'draft'
  end

  def submitted?
    status == 'submitted'
  end

  def reviewed?
    status == 'reviewed'
  end

  def submit!
    validation_errors = intake_form.validate_response(responses)
    
    if validation_errors.any?
      validation_errors.each do |error|
        errors.add(:responses, error[:message])
      end
      return false
    end

    update!(status: 'submitted', submitted_at: Time.current)
  end

  def mark_reviewed!
    update!(status: 'reviewed')
  end

  def response_for_field(field_id)
    responses[field_id]
  end

  def set_response(field_id, value)
    self.responses = (responses || {}).merge(field_id => value)
  end

  def complete?
    return false unless submitted?
    
    intake_form.required_fields.all? do |field|
      responses[field['id']].present?
    end
  end

  def field_responses_with_labels
    (intake_form.fields || []).map do |field|
      {
        field_id: field['id'],
        label: field['label'],
        type: field['type'],
        value: responses[field['id']],
        encrypted: encrypted_responses[field['id']].present?
      }
    end
  end

  private

  def valid_responses
    return if responses.blank?
    
    unless responses.is_a?(Hash)
      errors.add(:responses, 'must be a hash')
    end
  end
end
