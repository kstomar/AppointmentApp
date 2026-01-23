module Api
  module V1
    class AvailabilityController < BaseController
      skip_before_action :authenticate_user!, only: [:index]

      def index
        business = Business.find(params[:business_id])
        service = business.services.find(params[:service_id])

        service_result = Bookings::AvailabilityService.call(
          business: business,
          service: service,
          staff_member: params[:staff_member_id] ? StaffMember.find(params[:staff_member_id]) : nil,
          location: params[:location_id] ? Location.find(params[:location_id]) : nil,
          date_range: {
            start_date: params[:start_date] || Date.current,
            end_date: params[:end_date] || Date.current + 14.days
          }
        )

        if service_result.success?
          render_success(
            slots: service_result.result,
            meta: {
              business_id: business.id,
              service_id: service.id,
              start_date: params[:start_date] || Date.current.to_s,
              end_date: params[:end_date] || (Date.current + 14.days).to_s
            }
          )
        else
          render_error('Could not fetch availability', errors: service_result.errors.full_messages)
        end
      end

      private

      def skip_authorization?
        true
      end
    end
  end
end
