class Refund < ApplicationRecord
  include Tenantable

  STATUSES = %w[pending processing completed failed].freeze

  monetize :amount_cents

  belongs_to :tenant
  belongs_to :payment
  belongs_to :processed_by, class_name: 'User', optional: true

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :amount_cents, presence: true, numericality: { greater_than: 0 }
  validate :amount_not_exceeding_payment

  scope :pending, -> { where(status: 'pending') }
  scope :completed, -> { where(status: 'completed') }
  scope :failed, -> { where(status: 'failed') }

  def pending?
    status == 'pending'
  end

  def completed?
    status == 'completed'
  end

  def failed?
    status == 'failed'
  end

  def process!
    update!(status: 'processing')
  end

  def complete!(provider_refund_id = nil, response = {})
    update!(
      status: 'completed',
      provider_refund_id: provider_refund_id,
      provider_response: response,
      processed_at: Time.current
    )
  end

  def fail!(response = {})
    update!(
      status: 'failed',
      provider_response: response,
      processed_at: Time.current
    )
  end

  private

  def amount_not_exceeding_payment
    return unless payment && amount_cents
    
    if amount_cents > payment.refundable_amount
      errors.add(:amount_cents, 'exceeds refundable amount')
    end
  end
end
