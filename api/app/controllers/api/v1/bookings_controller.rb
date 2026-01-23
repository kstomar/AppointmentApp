module Api
  module V1
    class BookingsController < BaseController
      before_action :set_booking, only: [:show, :update, :cancel, :complete, :no_show, :reschedule]

      def index
        @bookings = policy_scope(Booking).includes(:service, :staff_member, :client, :location)
        @bookings = apply_filters(@bookings)
        @bookings = @bookings.order(start_at: :desc).page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@bookings)
      end

      def show
        authorize @booking
        render_success(booking_response(@booking))
      end

      def create
        authorize Booking

        service = Bookings::CreateBookingService.call(
          business: Business.find(params[:business_id]),
          service: Service.find(params[:service_id]),
          client: params[:client_id] ? User.find(params[:client_id]) : current_user,
          start_at: params[:start_at],
          staff_member: params[:staff_member_id] ? StaffMember.find(params[:staff_member_id]) : nil,
          location: params[:location_id] ? Location.find(params[:location_id]) : nil,
          booked_by: current_user,
          notes: params[:notes],
          attendees: params[:attendees] || [],
          intake_responses: params[:intake_responses] || {},
          source: params[:source] || 'web'
        )

        if service.success?
          log_audit(action: 'create', auditable: service.result)
          render_created(booking_response(service.result))
        else
          render_error('Booking failed', errors: service.errors.full_messages)
        end
      end

      def update
        authorize @booking

        if @booking.update(booking_params)
          log_audit(action: 'update', auditable: @booking, changes: @booking.previous_changes)
          render_success(booking_response(@booking), message: 'Booking updated successfully')
        else
          render_validation_errors(@booking)
        end
      end

      def cancel
        authorize @booking

        service = Bookings::CancelBookingService.call(
          booking: @booking,
          cancelled_by: current_user,
          reason: params[:reason],
          notify_waitlist: params[:notify_waitlist] != false
        )

        if service.success?
          log_audit(action: 'update', auditable: @booking, changes: { status: 'cancelled' })
          render_success(booking_response(service.result), message: 'Booking cancelled successfully')
        else
          render_error('Cancellation failed', errors: service.errors.full_messages)
        end
      end

      def complete
        authorize @booking

        if @booking.complete!
          log_audit(action: 'update', auditable: @booking, changes: { status: 'completed' })
          render_success(booking_response(@booking), message: 'Booking marked as completed')
        else
          render_error('Could not complete booking')
        end
      end

      def no_show
        authorize @booking

        if @booking.mark_no_show!
          log_audit(action: 'update', auditable: @booking, changes: { status: 'no_show' })
          render_success(booking_response(@booking), message: 'Booking marked as no-show')
        else
          render_error('Could not mark as no-show')
        end
      end

      def reschedule
        authorize @booking

        service = Bookings::RescheduleBookingService.call(
          booking: @booking,
          new_start_at: params[:new_start_at],
          staff_member: params[:staff_member_id] ? StaffMember.find(params[:staff_member_id]) : nil,
          rescheduled_by: current_user,
          reason: params[:reason]
        )

        if service.success?
          log_audit(action: 'update', auditable: @booking, changes: { start_at: params[:new_start_at] })
          render_success(booking_response(service.result), message: 'Booking rescheduled successfully')
        else
          render_error('Reschedule failed', errors: service.errors.full_messages)
        end
      end

      private

      def set_booking
        @booking = Booking.find(params[:id])
      end

      def booking_params
        params.permit(:client_notes, :internal_notes, :attendee_count)
      end

      def apply_filters(scope)
        scope = scope.where(business_id: params[:business_id]) if params[:business_id].present?
        scope = scope.where(service_id: params[:service_id]) if params[:service_id].present?
        scope = scope.where(staff_member_id: params[:staff_member_id]) if params[:staff_member_id].present?
        scope = scope.where(client_id: params[:client_id]) if params[:client_id].present?
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope = scope.for_date(Date.parse(params[:date])) if params[:date].present?
        scope = scope.where("start_at >= ?", params[:start_date]) if params[:start_date].present?
        scope = scope.where("start_at <= ?", params[:end_date]) if params[:end_date].present?
        scope
      end

      def booking_response(booking)
        {
          id: booking.id,
          confirmation_code: booking.confirmation_code,
          status: booking.status,
          booking_type: booking.booking_type,
          start_at: booking.start_at,
          end_at: booking.end_at,
          duration_minutes: booking.duration_minutes,
          service: {
            id: booking.service.id,
            name: booking.service.name
          },
          staff_member: booking.staff_member ? {
            id: booking.staff_member.id,
            name: booking.staff_member.display_name
          } : nil,
          client: {
            id: booking.client.id,
            name: booking.client.full_name,
            email: booking.client.email,
            phone: booking.client.phone
          },
          location: booking.location ? {
            id: booking.location.id,
            name: booking.location.name,
            address: booking.location.full_address
          } : nil,
          business: {
            id: booking.business.id,
            name: booking.business.name
          },
          total_amount: booking.total_amount&.format,
          deposit_amount: booking.deposit_amount&.format,
          paid_amount: booking.paid_amount&.format,
          payment_status: booking.payment_status,
          client_notes: booking.client_notes,
          internal_notes: booking.internal_notes,
          source: booking.source,
          attendee_count: booking.attendee_count,
          created_at: booking.created_at,
          updated_at: booking.updated_at
        }
      end
    end
  end
end
