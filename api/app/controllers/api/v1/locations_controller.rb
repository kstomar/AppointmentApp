module Api
  module V1
    class LocationsController < BaseController
      before_action :set_business
      before_action :set_location, only: [:show, :update, :destroy]

      def index
        @locations = policy_scope(@business.locations).includes(:business)
        @locations = @locations.active if params[:active_only] == 'true'
        @locations = @locations.page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@locations)
      end

      def show
        authorize @location
        render_success(location_response(@location))
      end

      def create
        @location = @business.locations.build(location_params)
        @location.tenant = current_tenant
        authorize @location

        if @location.save
          log_audit(action: 'create', auditable: @location)
          render_created(location_response(@location))
        else
          render_validation_errors(@location)
        end
      end

      def update
        authorize @location

        if @location.update(location_params)
          log_audit(action: 'update', auditable: @location, changes: @location.previous_changes)
          render_success(location_response(@location), message: 'Location updated successfully')
        else
          render_validation_errors(@location)
        end
      end

      def destroy
        authorize @location
        
        @location.discard
        log_audit(action: 'destroy', auditable: @location)
        render_success(message: 'Location deleted successfully')
      end

      private

      def set_business
        @business = Business.find(params[:business_id])
      end

      def set_location
        @location = @business.locations.find(params[:id])
      end

      def location_params
        params.permit(
          :name, :address_line1, :address_line2, :city, :state, :postal_code,
          :country, :latitude, :longitude, :phone, :email, :timezone,
          :is_primary, :is_virtual, :virtual_meeting_url, :status,
          operating_hours: {}
        )
      end

      def location_response(location)
        {
          id: location.id,
          business_id: location.business_id,
          name: location.name,
          address_line1: location.address_line1,
          address_line2: location.address_line2,
          city: location.city,
          state: location.state,
          postal_code: location.postal_code,
          country: location.country,
          full_address: location.full_address,
          latitude: location.latitude,
          longitude: location.longitude,
          phone: location.phone,
          email: location.email,
          timezone: location.timezone,
          is_primary: location.is_primary,
          is_virtual: location.is_virtual,
          virtual_meeting_url: location.virtual_meeting_url,
          status: location.status,
          operating_hours: location.operating_hours,
          created_at: location.created_at,
          updated_at: location.updated_at
        }
      end
    end
  end
end
