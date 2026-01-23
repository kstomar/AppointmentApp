class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    true
  end

  def show?
    true
  end

  def create?
    user.present?
  end

  def new?
    create?
  end

  def update?
    user.present?
  end

  def edit?
    update?
  end

  def destroy?
    user.present? && (user.super_admin? || user.business_admin?)
  end

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      raise NotImplementedError, "You must define #resolve in #{self.class}"
    end

    private

    attr_reader :user, :scope
  end

  private

  def super_admin?
    user&.super_admin?
  end

  def business_admin?
    user&.business_admin?
  end

  def staff?
    user&.staff?
  end

  def front_desk?
    user&.front_desk?
  end

  def client?
    user&.client?
  end

  def admin_or_above?
    super_admin? || business_admin?
  end

  def staff_or_above?
    admin_or_above? || staff? || front_desk?
  end
end
