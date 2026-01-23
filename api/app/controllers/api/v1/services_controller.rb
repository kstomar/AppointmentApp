module Api
  module V1
    class ServicesController < BaseController
      before_action :set_business
      before_action :set_service, only: [:show, :update, :destroy]

      def index
        @services = policy_scope(@business.services).includes(:category, :staff_members)
        @services = @services.active if params[:active_only] == 'true'
        @services = @services.public_services if params[:public_only] == 'true'
        @services = @services.where(category_id: params[:category_id]) if params[:category_id].present?
        @services = @services.page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@services)
      end

      def show
        authorize @service
        render_success(service_response(@service))
      end

      def create
        @service = @business.services.build(service_params)
        @service.tenant = current_tenant
        authorize @service

        if @service.save
          log_audit(action: 'create', auditable: @service)
          render_created(service_response(@service))
        else
          render_validation_errors(@service)
        end
      end

      def update
        authorize @service

        if @service.update(service_params)
          log_audit(action: 'update', auditable: @service, changes: @service.previous_changes)
          render_success(service_response(@service), message: 'Service updated successfully')
        else
          render_validation_errors(@service)
        end
      end

      def destroy
        authorize @service
        
        @service.discard
        log_audit(action: 'destroy', auditable: @service)
        render_success(message: 'Service deleted successfully')
      end

      private

      def set_business
        @business = Business.find(params[:business_id])
      end

      def set_service
        @service = @business.services.find(params[:id])
      end

      def service_params
        params.permit(
          :name, :description, :service_type, :category_id,
          :duration_minutes, :buffer_before_minutes, :buffer_after_minutes,
          :price_cents, :price_currency, :deposit_amount_cents, :deposit_amount_currency,
          :max_attendees, :min_attendees, :is_public, :allow_online_booking,
          :requires_confirmation, :status, intake_form_config: {}
        )
      end

      def service_response(service)
        {
          id: service.id,
          business_id: service.business_id,
          name: service.name,
          slug: service.slug,
          description: service.description,
          service_type: service.service_type,
          category: service.category ? { id: service.category.id, name: service.category.name } : nil,
          duration_minutes: service.duration_minutes,
          buffer_before_minutes: service.buffer_before_minutes,
          buffer_after_minutes: service.buffer_after_minutes,
          total_duration_minutes: service.total_duration_minutes,
          price: service.price&.format,
          price_cents: service.price_cents,
          deposit_amount: service.deposit_amount&.format,
          deposit_amount_cents: service.deposit_amount_cents,
          max_attendees: service.max_attendees,
          min_attendees: service.min_attendees,
          is_public: service.is_public,
          allow_online_booking: service.allow_online_booking,
          requires_confirmation: service.requires_confirmation,
          status: service.status,
          staff_count: service.staff_members.count,
          created_at: service.created_at,
          updated_at: service.updated_at
        }
      end
    end
  end
end
