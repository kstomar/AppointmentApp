module Api
  module V1
    module Public
      class BookingsController < ApplicationController
        before_action :set_business

        def availability
          service = @business.services.find(params[:service_id])

          result = Bookings::AvailabilityService.call(
            business: @business,
            service: service,
            staff_member: params[:staff_member_id] ? @business.staff_members.find(params[:staff_member_id]) : nil,
            location: params[:location_id] ? @business.locations.find(params[:location_id]) : nil,
            date_range: {
              start_date: params[:start_date] || Date.current,
              end_date: params[:end_date] || Date.current + 14.days
            }
          )

          if result.success?
            render_success(
              slots: result.result,
              service: service_info(service),
              business: business_info(@business)
            )
          else
            render_error('Could not fetch availability', errors: result.errors.full_messages)
          end
        end

        def create
          service = @business.services.find(params[:service_id])
          
          client = find_or_create_client
          return if performed?

          ActsAsTenant.with_tenant(@business.tenant) do
            result = Bookings::CreateBookingService.call(
              business: @business,
              service: service,
              client: client,
              start_at: params[:start_at],
              staff_member: params[:staff_member_id] ? @business.staff_members.find(params[:staff_member_id]) : nil,
              location: params[:location_id] ? @business.locations.find(params[:location_id]) : nil,
              notes: params[:notes],
              attendees: params[:attendees] || [],
              intake_responses: params[:intake_responses] || {},
              source: 'public_booking'
            )

            if result.success?
              render_created(public_booking_response(result.result))
            else
              render_error('Booking failed', errors: result.errors.full_messages)
            end
          end
        end

        def show
          booking = Booking.find_by!(confirmation_code: params[:confirmation_code])
          render_success(public_booking_response(booking))
        end

        def cancel
          booking = Booking.find_by!(confirmation_code: params[:confirmation_code])

          unless booking.can_cancel?
            return render_error('This booking cannot be cancelled')
          end

          ActsAsTenant.with_tenant(booking.tenant) do
            result = Bookings::CancelBookingService.call(
              booking: booking,
              cancelled_by: booking.client,
              reason: params[:reason]
            )

            if result.success?
              render_success(public_booking_response(result.result), message: 'Booking cancelled')
            else
              render_error('Cancellation failed', errors: result.errors.full_messages)
            end
          end
        end

        def reschedule
          booking = Booking.find_by!(confirmation_code: params[:confirmation_code])

          unless booking.can_reschedule?
            return render_error('This booking cannot be rescheduled')
          end

          ActsAsTenant.with_tenant(booking.tenant) do
            result = Bookings::RescheduleBookingService.call(
              booking: booking,
              new_start_at: params[:new_start_at],
              rescheduled_by: booking.client,
              reason: params[:reason]
            )

            if result.success?
              render_success(public_booking_response(result.result), message: 'Booking rescheduled')
            else
              render_error('Reschedule failed', errors: result.errors.full_messages)
            end
          end
        end

        private

        def set_business
          @business = if params[:business_slug]
                        Business.find_by!(slug: params[:business_slug])
                      else
                        Business.find(params[:business_id])
                      end
        end

        def find_or_create_client
          ActsAsTenant.with_tenant(@business.tenant) do
            user = User.find_by(email: params[:client_email]&.downcase)
            
            if user
              return user
            end

            user = User.new(
              tenant: @business.tenant,
              email: params[:client_email],
              first_name: params[:client_first_name],
              last_name: params[:client_last_name],
              phone: params[:client_phone],
              role: 'client',
              password: SecureRandom.hex(16)
            )

            if user.save
              user
            else
              render_error('Invalid client information', errors: user.errors.full_messages)
              nil
            end
          end
        end

        def business_info(business)
          {
            id: business.id,
            name: business.name,
            slug: business.slug,
            timezone: business.timezone,
            currency: business.currency,
            cancellation_policy_hours: business.cancellation_policy_hours
          }
        end

        def service_info(service)
          {
            id: service.id,
            name: service.name,
            description: service.description,
            duration_minutes: service.duration_minutes,
            price: service.price&.format,
            deposit_amount: service.deposit_amount&.format
          }
        end

        def public_booking_response(booking)
          {
            confirmation_code: booking.confirmation_code,
            status: booking.status,
            start_at: booking.start_at,
            end_at: booking.end_at,
            duration_minutes: booking.duration_minutes,
            service: {
              name: booking.service.name,
              description: booking.service.description
            },
            staff_member: booking.staff_member ? {
              name: booking.staff_member.display_name
            } : nil,
            location: booking.location ? {
              name: booking.location.name,
              address: booking.location.full_address,
              is_virtual: booking.location.is_virtual,
              virtual_meeting_url: booking.location.is_virtual ? booking.location.virtual_meeting_url : nil
            } : nil,
            business: {
              name: booking.business.name,
              phone: booking.business.phone,
              email: booking.business.email
            },
            total_amount: booking.total_amount&.format,
            deposit_amount: booking.deposit_amount&.format,
            payment_status: booking.payment_status,
            can_cancel: booking.can_cancel?,
            can_reschedule: booking.can_reschedule?
          }
        end
      end
    end
  end
end
