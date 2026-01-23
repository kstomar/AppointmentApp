class BookingPolicy < ApplicationPolicy
  def show?
    staff_or_above? || is_client? || is_attendee?
  end

  def create?
    true
  end

  def update?
    staff_or_above? || is_client?
  end

  def cancel?
    staff_or_above? || (is_client? && record.can_cancel?)
  end

  def complete?
    staff_or_above?
  end

  def no_show?
    staff_or_above?
  end

  def reschedule?
    staff_or_above? || (is_client? && record.can_reschedule?)
  end

  def pay?
    is_client? || staff_or_above?
  end

  class Scope < Scope
    def resolve
      if user.super_admin?
        scope.all
      elsif user.business_admin?
        scope.joins(:business).where(businesses: { owner_id: user.id })
      elsif user.staff?
        scope.joins(:staff_member).where(staff_members: { user_id: user.id })
      elsif user.front_desk?
        scope.joins(business: :staff_members).where(staff_members: { user_id: user.id })
      else
        scope.where(client_id: user.id)
      end
    end
  end

  private

  def is_client?
    record.client_id == user.id
  end

  def is_attendee?
    record.booking_attendees.exists?(user_id: user.id)
  end
end
