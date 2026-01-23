class FeatureFlag < ApplicationRecord
  belongs_to :tenant, optional: true

  validates :name, presence: true, 
                   uniqueness: { scope: :tenant_id },
                   format: { with: /\A[a-z][a-z0-9_]*\z/, message: 'must be lowercase with underscores' }
  validates :percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }

  scope :global, -> { where(tenant_id: nil) }
  scope :for_tenant, ->(tenant_id) { where(tenant_id: [nil, tenant_id]) }
  scope :enabled_flags, -> { where(enabled: true) }

  def self.enabled?(name, tenant: nil, user: nil)
    flag = for_tenant(tenant&.id).find_by(name: name)
    return false unless flag
    
    flag.enabled_for?(tenant: tenant, user: user)
  end

  def enabled_for?(tenant: nil, user: nil)
    return false unless enabled?
    
    return true if percentage >= 100
    return false if percentage <= 0

    if user
      user_hash = Digest::MD5.hexdigest("#{name}-#{user.id}").to_i(16)
      return (user_hash % 100) < percentage
    end

    if tenant
      tenant_hash = Digest::MD5.hexdigest("#{name}-#{tenant.id}").to_i(16)
      return (tenant_hash % 100) < percentage
    end

    true
  end

  def enable!
    update!(enabled: true)
  end

  def disable!
    update!(enabled: false)
  end

  def set_percentage!(value)
    update!(percentage: value)
  end

  def add_rule(rule_type, value)
    self.rules = (rules || {}).merge(rule_type => value)
    save!
  end

  def remove_rule(rule_type)
    self.rules = (rules || {}).except(rule_type)
    save!
  end
end
