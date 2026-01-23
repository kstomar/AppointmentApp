class NotificationPolicy < ApplicationPolicy
  def show?
    is_recipient?
  end

  def mark_read?
    is_recipient?
  end

  class Scope < Scope
    def resolve
      scope.where(user_id: user.id)
    end
  end

  private

  def is_recipient?
    record.user_id == user.id
  end
end
