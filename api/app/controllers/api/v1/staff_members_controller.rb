module Api
  module V1
    class StaffMembersController < BaseController
      before_action :set_business
      before_action :set_staff_member, only: [:show, :update, :destroy, :assign_services]

      def index
        @staff_members = policy_scope(@business.staff_members).includes(:user, :location, :services)
        @staff_members = @staff_members.active if params[:active_only] == 'true'
        @staff_members = @staff_members.bookable if params[:bookable_only] == 'true'
        @staff_members = @staff_members.where(location_id: params[:location_id]) if params[:location_id].present?
        @staff_members = @staff_members.page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@staff_members)
      end

      def show
        authorize @staff_member
        render_success(staff_member_response(@staff_member))
      end

      def create
        @staff_member = @business.staff_members.build(staff_member_params)
        @staff_member.tenant = current_tenant
        authorize @staff_member

        if @staff_member.save
          log_audit(action: 'create', auditable: @staff_member)
          render_created(staff_member_response(@staff_member))
        else
          render_validation_errors(@staff_member)
        end
      end

      def update
        authorize @staff_member

        if @staff_member.update(staff_member_params)
          log_audit(action: 'update', auditable: @staff_member, changes: @staff_member.previous_changes)
          render_success(staff_member_response(@staff_member), message: 'Staff member updated successfully')
        else
          render_validation_errors(@staff_member)
        end
      end

      def destroy
        authorize @staff_member
        
        @staff_member.discard
        log_audit(action: 'destroy', auditable: @staff_member)
        render_success(message: 'Staff member deleted successfully')
      end

      def assign_services
        authorize @staff_member

        service_ids = params[:service_ids] || []
        @staff_member.service_ids = service_ids

        log_audit(action: 'update', auditable: @staff_member, changes: { services: service_ids })
        render_success(staff_member_response(@staff_member), message: 'Services assigned successfully')
      end

      private

      def set_business
        @business = Business.find(params[:business_id])
      end

      def set_staff_member
        @staff_member = @business.staff_members.find(params[:id])
      end

      def staff_member_params
        params.permit(
          :user_id, :location_id, :title, :bio, :status, :role,
          :is_bookable, :accepts_new_clients, :max_daily_bookings,
          skills: []
        )
      end

      def staff_member_response(staff_member)
        {
          id: staff_member.id,
          business_id: staff_member.business_id,
          user: {
            id: staff_member.user.id,
            name: staff_member.user.full_name,
            email: staff_member.user.email,
            avatar_url: staff_member.user.avatar_url
          },
          location: staff_member.location ? {
            id: staff_member.location.id,
            name: staff_member.location.name
          } : nil,
          title: staff_member.title,
          bio: staff_member.bio,
          status: staff_member.status,
          role: staff_member.role,
          skills: staff_member.skills,
          is_bookable: staff_member.is_bookable,
          accepts_new_clients: staff_member.accepts_new_clients,
          max_daily_bookings: staff_member.max_daily_bookings,
          services: staff_member.services.map { |s| { id: s.id, name: s.name } },
          created_at: staff_member.created_at,
          updated_at: staff_member.updated_at
        }
      end
    end
  end
end
