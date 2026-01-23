class PaymentPolicy < ApplicationPolicy
  def show?
    admin_or_above? || is_payer?
  end

  def refund?
    admin_or_above?
  end

  class Scope < Scope
    def resolve
      if user.super_admin?
        scope.all
      elsif user.business_admin?
        scope.joins(:business).where(businesses: { owner_id: user.id })
      elsif user.staff? || user.front_desk?
        scope.joins(business: :staff_members).where(staff_members: { user_id: user.id })
      else
        scope.where(user_id: user.id)
      end
    end
  end

  private

  def is_payer?
    record.user_id == user.id
  end
end
