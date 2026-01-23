class Invoice < ApplicationRecord
  include Tenantable
  include Auditable

  STATUSES = %w[draft sent paid partially_paid overdue cancelled void].freeze

  monetize :subtotal_cents, allow_nil: true
  monetize :tax_amount_cents, allow_nil: true
  monetize :discount_amount_cents, allow_nil: true
  monetize :total_amount_cents, allow_nil: true
  monetize :paid_amount_cents, allow_nil: true

  belongs_to :tenant
  belongs_to :business
  belongs_to :client, class_name: 'User'
  belongs_to :booking, optional: true

  validates :invoice_number, presence: true, uniqueness: { scope: :business_id }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :currency, presence: true, length: { is: 3 }

  before_validation :generate_invoice_number, on: :create

  scope :draft, -> { where(status: 'draft') }
  scope :sent, -> { where(status: 'sent') }
  scope :paid, -> { where(status: 'paid') }
  scope :overdue, -> { where(status: 'overdue') }
  scope :unpaid, -> { where(status: %w[sent overdue]) }
  scope :due_soon, -> { unpaid.where("due_date <= ?", 7.days.from_now) }

  def draft?
    status == 'draft'
  end

  def sent?
    status == 'sent'
  end

  def paid?
    status == 'paid'
  end

  def overdue?
    status == 'overdue' || (unpaid? && due_date && due_date < Date.current)
  end

  def unpaid?
    %w[sent overdue].include?(status)
  end

  def balance_due
    (total_amount_cents || 0) - (paid_amount_cents || 0)
  end

  def fully_paid?
    balance_due <= 0
  end

  def send_invoice!
    update!(status: 'sent', issue_date: Date.current) if draft?
  end

  def mark_paid!
    update!(status: 'paid', paid_at: Time.current, paid_amount_cents: total_amount_cents)
  end

  def record_payment!(amount)
    new_paid = (paid_amount_cents || 0) + amount
    
    if new_paid >= (total_amount_cents || 0)
      update!(paid_amount_cents: new_paid, status: 'paid', paid_at: Time.current)
    else
      update!(paid_amount_cents: new_paid, status: 'partially_paid')
    end
  end

  def void!
    update!(status: 'void')
  end

  def add_line_item(description:, quantity:, unit_price_cents:, tax_rate: 0)
    item = {
      description: description,
      quantity: quantity,
      unit_price_cents: unit_price_cents,
      tax_rate: tax_rate,
      total_cents: quantity * unit_price_cents
    }
    
    self.line_items = (line_items || []) + [item]
    recalculate_totals
  end

  def recalculate_totals
    items = line_items || []
    
    self.subtotal_cents = items.sum { |i| i['total_cents'] || 0 }
    self.tax_amount_cents = items.sum { |i| ((i['total_cents'] || 0) * (i['tax_rate'] || 0) / 100.0).round }
    self.total_amount_cents = subtotal_cents + tax_amount_cents - (discount_amount_cents || 0)
  end

  private

  def generate_invoice_number
    return if invoice_number.present?
    
    prefix = "INV"
    year = Date.current.year
    
    last_invoice = business.invoices
                           .where("invoice_number LIKE ?", "#{prefix}-#{year}-%")
                           .order(created_at: :desc)
                           .first
    
    if last_invoice
      last_number = last_invoice.invoice_number.split('-').last.to_i
      self.invoice_number = "#{prefix}-#{year}-#{(last_number + 1).to_s.rjust(5, '0')}"
    else
      self.invoice_number = "#{prefix}-#{year}-00001"
    end
  end
end
