class Payment < ApplicationRecord
  include Tenantable
  include Auditable

  PAYMENT_TYPES = %w[deposit full_payment partial_payment refund].freeze
  STATUSES = %w[pending processing completed failed cancelled refunded].freeze
  PROVIDERS = %w[stripe razorpay cash bank_transfer other].freeze

  monetize :amount_cents
  monetize :refunded_amount_cents, allow_nil: true
  monetize :fee_amount_cents, allow_nil: true

  belongs_to :tenant
  belongs_to :booking, optional: true
  belongs_to :user
  belongs_to :business
  has_many :refunds, dependent: :destroy

  validates :payment_type, presence: true, inclusion: { in: PAYMENT_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :provider, presence: true, inclusion: { in: PROVIDERS }
  validates :amount_cents, presence: true, numericality: { greater_than: 0 }
  validates :currency, presence: true, length: { is: 3 }

  scope :completed, -> { where(status: 'completed') }
  scope :pending, -> { where(status: 'pending') }
  scope :failed, -> { where(status: 'failed') }
  scope :by_provider, ->(provider) { where(provider: provider) }
  scope :for_date_range, ->(start_date, end_date) { where(created_at: start_date..end_date) }

  def completed?
    status == 'completed'
  end

  def pending?
    status == 'pending'
  end

  def failed?
    status == 'failed'
  end

  def refunded?
    status == 'refunded'
  end

  def refundable?
    completed? && refundable_amount > 0
  end

  def refundable_amount
    amount_cents - (refunded_amount_cents || 0)
  end

  def fully_refunded?
    refunded_amount_cents.present? && refunded_amount_cents >= amount_cents
  end

  def mark_completed!
    update!(status: 'completed', paid_at: Time.current)
  end

  def mark_failed!(reason = nil)
    update!(status: 'failed', failed_at: Time.current, failure_reason: reason)
  end

  def process_refund!(amount, reason: nil, processed_by: nil)
    return false unless refundable?
    return false if amount > refundable_amount

    transaction do
      refund = refunds.create!(
        tenant: tenant,
        amount_cents: amount,
        reason: reason,
        processed_by: processed_by,
        status: 'pending'
      )

      new_refunded = (refunded_amount_cents || 0) + amount
      update!(refunded_amount_cents: new_refunded)
      
      if fully_refunded?
        update!(status: 'refunded', refunded_at: Time.current)
      end

      refund
    end
  end
end
