class CalendarIntegrationPolicy < ApplicationPolicy
  def show?
    is_owner?
  end

  def update?
    is_owner?
  end

  def destroy?
    is_owner?
  end

  def sync?
    is_owner?
  end

  class Scope < Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end

  private

  def is_owner?
    record.user_id == user.id
  end
end
