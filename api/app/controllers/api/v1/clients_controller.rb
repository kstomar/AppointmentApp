module Api
  module V1
    class ClientsController < BaseController
      before_action :set_client, only: [:show, :update, :destroy]

      def index
        # Get clients (users with role='client') who have bookings with the current user's business
        business_ids = current_user.owned_businesses.pluck(:id) + 
                       current_user.staff_members.pluck(:business_id)
        
        @clients = User.joins(:bookings)
                       .where(bookings: { business_id: business_ids })
                       .where(role: 'client')
                       .distinct
                       .includes(:bookings)

        @clients = @clients.where("users.first_name ILIKE :q OR users.last_name ILIKE :q OR users.email ILIKE :q", 
                                  q: "%#{params[:search]}%") if params[:search].present?
        @clients = @clients.where(status: params[:status]) if params[:status].present?
        @clients = @clients.order(created_at: :desc).page(params[:page]).per(params[:per_page] || 20)

        render_paginated(@clients, serializer: :client_response)
      end

      def show
        render_success(client_response(@client))
      end

      def create
        @client = User.new(client_params)
        @client.role = 'client'
        @client.tenant = current_tenant
        @client.password = SecureRandom.hex(16) unless client_params[:password].present?

        if @client.save
          log_audit(action: 'create', auditable: @client)
          render_created(client_response(@client))
        else
          render_validation_errors(@client)
        end
      end

      def update
        if @client.update(client_params.except(:password))
          log_audit(action: 'update', auditable: @client, changes: @client.previous_changes)
          render_success(client_response(@client), message: 'Client updated successfully')
        else
          render_validation_errors(@client)
        end
      end

      def destroy
        @client.discard
        log_audit(action: 'destroy', auditable: @client)
        render_success(message: 'Client deleted successfully')
      end

      private

      def set_client
        @client = User.find(params[:id])
      end

      def client_params
        params.permit(:email, :first_name, :last_name, :phone, :password, :status)
      end

      def client_response(client)
        business_ids = current_user.owned_businesses.pluck(:id) + 
                       current_user.staff_members.pluck(:business_id)
        
        client_bookings = client.bookings.where(business_id: business_ids)
        
        {
          id: client.id,
          email: client.email,
          first_name: client.first_name,
          last_name: client.last_name,
          full_name: client.full_name,
          phone: client.phone,
          avatar_url: client.avatar_url,
          status: client.status,
          created_at: client.created_at,
          updated_at: client.updated_at,
          total_bookings: client_bookings.count,
          last_booking_at: client_bookings.order(start_at: :desc).first&.start_at,
          total_spent: format_money(client_bookings.sum(:total_amount_cents))
        }
      end

      def format_money(cents)
        return '$0.00' if cents.nil? || cents == 0
        "$#{(cents / 100.0).round(2)}"
      end

      def render_paginated(collection, serializer: nil)
        data = collection.map { |item| client_response(item) }
        
        render json: {
          success: true,
          data: data,
          meta: {
            current_page: collection.current_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count,
            per_page: collection.limit_value
          }
        }
      end
    end
  end
end
