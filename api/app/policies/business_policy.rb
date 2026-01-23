class BusinessPolicy < ApplicationPolicy
  def show?
    true
  end

  def create?
    admin_or_above?
  end

  def update?
    admin_or_above? && owns_business?
  end

  def destroy?
    super_admin? || (business_admin? && owns_business?)
  end

  class Scope < Scope
    def resolve
      if user.super_admin?
        scope.all
      elsif user.business_admin?
        scope.where(owner_id: user.id)
      elsif user.staff? || user.front_desk?
        scope.joins(:staff_members).where(staff_members: { user_id: user.id })
      else
        scope.none
      end
    end
  end

  private

  def owns_business?
    record.owner_id == user.id
  end
end
