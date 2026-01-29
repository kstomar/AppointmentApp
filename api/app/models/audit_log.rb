class AuditLog < ApplicationRecord
  include Tenantable

  ACTIONS = %w[create update destroy login logout view export].freeze

  belongs_to :user, optional: true

  validates :action, presence: true, inclusion: { in: ACTIONS }

  scope :for_record, ->(type, id) { where(auditable_type: type, auditable_id: id) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :by_action, ->(action) { where(action: action) }
  scope :recent, -> { order(created_at: :desc) }
  scope :for_date_range, ->(start_date, end_date) { where(created_at: start_date..end_date) }

  def self.log(action:, auditable: nil, user: nil, changes: {}, metadata: {}, request: nil)
    create!(
      user_id: user&.id,
      auditable_type: auditable&.class&.name,
      auditable_id: auditable&.id,
      action: action,
      audited_changes: changes,
      metadata: metadata,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent,
      request_id: request&.request_id
    )
  end

  def auditable
    return nil unless auditable_type && auditable_id
    
    auditable_type.constantize.find_by(id: auditable_id)
  end

  def description
    case action
    when 'create'
      "Created #{auditable_type&.underscore&.humanize}"
    when 'update'
      changed_fields = audited_changes.keys.join(', ')
      "Updated #{auditable_type&.underscore&.humanize}: #{changed_fields}"
    when 'destroy'
      "Deleted #{auditable_type&.underscore&.humanize}"
    when 'login'
      "User logged in"
    when 'logout'
      "User logged out"
    when 'view'
      "Viewed #{auditable_type&.underscore&.humanize}"
    when 'export'
      "Exported data"
    else
      action.humanize
    end
  end
end
