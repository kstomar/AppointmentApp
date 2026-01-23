class LocationPolicy < ApplicationPolicy
  def show?
    true
  end

  def create?
    admin_or_above? && can_manage_business?
  end

  def update?
    admin_or_above? && can_manage_business?
  end

  def destroy?
    admin_or_above? && can_manage_business?
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
        scope.none
      end
    end
  end

  private

  def can_manage_business?
    record.business.owner_id == user.id || user.super_admin?
  end
end
