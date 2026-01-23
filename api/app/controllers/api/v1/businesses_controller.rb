module Api
  module V1
    class BusinessesController < BaseController
      before_action :set_business, only: [:show, :update, :destroy]

      def index
        @businesses = policy_scope(Business).includes(:owner, :locations)
        @businesses = @businesses.where(status: params[:status]) if params[:status].present?
        @businesses = @businesses.page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@businesses)
      end

      def show
        authorize @business
        render_success(business_response(@business))
      end

      def create
        @business = current_user.owned_businesses.build(business_params)
        @business.tenant = current_tenant
        authorize @business

        if @business.save
          log_audit(action: 'create', auditable: @business)
          render_created(business_response(@business))
        else
          render_validation_errors(@business)
        end
      end

      def update
        authorize @business

        if @business.update(business_params)
          log_audit(action: 'update', auditable: @business, changes: @business.previous_changes)
          render_success(business_response(@business), message: 'Business updated successfully')
        else
          render_validation_errors(@business)
        end
      end

      def destroy
        authorize @business
        
        @business.discard
        log_audit(action: 'destroy', auditable: @business)
        render_success(message: 'Business deleted successfully')
      end

      private

      def set_business
        @business = Business.find(params[:id])
      end

      def business_params
        params.permit(
          :name, :description, :industry, :phone, :email, :website,
          :timezone, :currency, :booking_lead_time_minutes, :booking_window_days,
          :cancellation_policy_hours, :deposit_percentage, :auto_confirm_bookings,
          booking_settings: {}, payment_settings: {}, settings: {}
        )
      end

      def business_response(business)
        {
          id: business.id,
          name: business.name,
          slug: business.slug,
          description: business.description,
          industry: business.industry,
          status: business.status,
          phone: business.phone,
          email: business.email,
          website: business.website,
          timezone: business.timezone,
          currency: business.currency,
          booking_lead_time_minutes: business.booking_lead_time_minutes,
          booking_window_days: business.booking_window_days,
          cancellation_policy_hours: business.cancellation_policy_hours,
          deposit_percentage: business.deposit_percentage,
          booking_url: business.booking_url,
          owner: {
            id: business.owner.id,
            name: business.owner.full_name,
            email: business.owner.email
          },
          locations_count: business.locations.count,
          created_at: business.created_at,
          updated_at: business.updated_at
        }
      end
    end
  end
end
