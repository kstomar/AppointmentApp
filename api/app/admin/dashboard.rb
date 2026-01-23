ActiveAdmin.register_page "Dashboard" do
  menu priority: 1, label: proc { I18n.t("active_admin.dashboard") }

  content title: proc { I18n.t("active_admin.dashboard") } do
    columns do
      column do
        panel "Recent Bookings" do
          table_for Booking.order(created_at: :desc).limit(10) do
            column :confirmation_code
            column :client do |booking|
              booking.client&.full_name
            end
            column :service do |booking|
              booking.service&.name
            end
            column :start_at
            column :status
            column :created_at
          end
        end
      end

      column do
        panel "Statistics" do
          div do
            h3 "Total Businesses: #{Business.count}"
          end
          div do
            h3 "Total Bookings: #{Booking.count}"
          end
          div do
            h3 "Today's Bookings: #{Booking.where('start_at >= ? AND start_at < ?', Date.current.beginning_of_day, Date.current.end_of_day).count}"
          end
          div do
            h3 "Total Users: #{User.count}"
          end
          div do
            h3 "Total Revenue: #{Payment.where(status: 'completed').sum(:amount_cents) / 100.0}"
          end
        end
      end
    end

    columns do
      column do
        panel "Recent Businesses" do
          table_for Business.order(created_at: :desc).limit(5) do
            column :name
            column :industry
            column :status
            column :created_at
          end
        end
      end

      column do
        panel "Recent Payments" do
          table_for Payment.order(created_at: :desc).limit(5) do
            column :booking do |payment|
              payment.booking&.confirmation_code
            end
            column :amount do |payment|
              number_to_currency(payment.amount_cents / 100.0)
            end
            column :status
            column :provider
            column :created_at
          end
        end
      end
    end
  end
end
