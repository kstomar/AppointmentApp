module Api
  module V1
    class ReportsController < BaseController
      def dashboard
        business_ids = get_business_ids
        date_range = get_date_range
        
        bookings = Booking.where(business_id: business_ids)
                          .where(start_at: date_range)
        
        previous_range = get_previous_date_range
        previous_bookings = Booking.where(business_id: business_ids)
                                   .where(start_at: previous_range)

        render_success({
          stats: calculate_stats(bookings, previous_bookings),
          bookings_by_day: bookings_by_day(bookings),
          bookings_by_service: bookings_by_service(bookings),
          bookings_by_status: bookings_by_status(bookings),
          revenue_by_month: revenue_by_month(business_ids),
          top_staff: top_staff(bookings),
          peak_hours: peak_hours(bookings),
          booking_sources: booking_sources(bookings)
        })
      end

      def bookings
        business_ids = get_business_ids
        date_range = get_date_range
        
        bookings = Booking.where(business_id: business_ids)
                          .where(start_at: date_range)

        render_success({
          bookings_by_day: bookings_by_day(bookings),
          bookings_by_status: bookings_by_status(bookings),
          peak_hours: peak_hours(bookings),
          booking_sources: booking_sources(bookings)
        })
      end

      def revenue
        business_ids = get_business_ids
        date_range = get_date_range
        
        payments = Payment.where(business_id: business_ids)
                          .where(created_at: date_range)
                          .where(status: 'completed')

        render_success({
          revenue_by_month: revenue_by_month(business_ids),
          revenue_by_service: revenue_by_service(business_ids, date_range),
          payment_methods: payment_methods(payments)
        })
      end

      def staff_performance
        business_ids = get_business_ids
        date_range = get_date_range
        
        bookings = Booking.where(business_id: business_ids)
                          .where(start_at: date_range)

        render_success({
          top_staff: top_staff(bookings),
          staff_utilization: staff_utilization(business_ids, date_range)
        })
      end

      private

      def get_business_ids
        current_user.owned_businesses.pluck(:id) + 
        current_user.staff_members.pluck(:business_id)
      end

      def get_date_range
        days = (params[:days] || 30).to_i
        start_date = params[:start_date] ? Date.parse(params[:start_date]) : days.days.ago.beginning_of_day
        end_date = params[:end_date] ? Date.parse(params[:end_date]) : Time.current
        start_date..end_date
      end

      def get_previous_date_range
        days = (params[:days] || 30).to_i
        end_date = days.days.ago.beginning_of_day
        start_date = (days * 2).days.ago.beginning_of_day
        start_date..end_date
      end

      def calculate_stats(bookings, previous_bookings)
        total_bookings = bookings.count
        prev_total = previous_bookings.count
        booking_change = prev_total > 0 ? ((total_bookings - prev_total).to_f / prev_total * 100).round(0) : 0

        revenue = bookings.sum(:total_amount_cents) / 100.0
        prev_revenue = previous_bookings.sum(:total_amount_cents) / 100.0
        revenue_change = prev_revenue > 0 ? ((revenue - prev_revenue) / prev_revenue * 100).round(0) : 0

        new_clients = bookings.select('DISTINCT client_id').count
        prev_new_clients = previous_bookings.select('DISTINCT client_id').count
        clients_change = prev_new_clients > 0 ? ((new_clients - prev_new_clients).to_f / prev_new_clients * 100).round(0) : 0

        avg_value = total_bookings > 0 ? (revenue / total_bookings).round(2) : 0
        prev_avg = prev_total > 0 ? (prev_revenue / prev_total).round(2) : 0
        avg_change = prev_avg > 0 ? ((avg_value - prev_avg) / prev_avg * 100).round(0) : 0

        cancelled = bookings.where(status: 'cancelled').count
        cancellation_rate = total_bookings > 0 ? (cancelled.to_f / total_bookings * 100).round(0) : 0
        prev_cancelled = previous_bookings.where(status: 'cancelled').count
        prev_cancel_rate = prev_total > 0 ? (prev_cancelled.to_f / prev_total * 100).round(0) : 0
        cancel_change = prev_cancel_rate - cancellation_rate

        avg_duration = bookings.average(:duration_minutes)&.round(0) || 0
        prev_avg_duration = previous_bookings.average(:duration_minutes)&.round(0) || 0
        duration_change = avg_duration - prev_avg_duration

        [
          { label: 'Total Bookings', value: total_bookings.to_s, change: "#{booking_change >= 0 ? '+' : ''}#{booking_change}%", trend: booking_change >= 0 ? 'up' : 'down' },
          { label: 'Revenue', value: "$#{revenue.round(2).to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}", change: "#{revenue_change >= 0 ? '+' : ''}#{revenue_change}%", trend: revenue_change >= 0 ? 'up' : 'down' },
          { label: 'New Clients', value: new_clients.to_s, change: "#{clients_change >= 0 ? '+' : ''}#{clients_change}%", trend: clients_change >= 0 ? 'up' : 'down' },
          { label: 'Avg. Booking Value', value: "$#{avg_value}", change: "#{avg_change >= 0 ? '+' : ''}#{avg_change}%", trend: avg_change >= 0 ? 'up' : 'down' },
          { label: 'Cancellation Rate', value: "#{cancellation_rate}%", change: "#{cancel_change >= 0 ? '+' : ''}#{cancel_change}%", trend: cancel_change <= 0 ? 'up' : 'down' },
          { label: 'Avg. Duration', value: "#{avg_duration} min", change: "#{duration_change >= 0 ? '+' : ''}#{duration_change} min", trend: duration_change >= 0 ? 'up' : 'down' }
        ]
      end

      def bookings_by_day(bookings)
        days = %w[Mon Tue Wed Thu Fri Sat Sun]
        result = days.map { |d| { date: d, bookings: 0, revenue: 0 } }
        
        bookings.group_by { |b| b.start_at.strftime('%a') }.each do |day, day_bookings|
          idx = days.index(day)
          next unless idx
          result[idx][:bookings] = day_bookings.count
          result[idx][:revenue] = day_bookings.sum(&:total_amount_cents) / 100
        end
        
        result
      end

      def bookings_by_service(bookings)
        bookings.joins(:service)
                .group('services.name')
                .count
                .map { |name, count| { name: name, value: count } }
                .sort_by { |h| -h[:value] }
                .first(5)
      end

      def bookings_by_status(bookings)
        status_colors = {
          'completed' => '#22c55e',
          'confirmed' => '#3b82f6',
          'pending' => '#f59e0b',
          'cancelled' => '#ef4444',
          'no_show' => '#f97316'
        }
        
        bookings.group(:status).count.map do |status, count|
          { name: status.capitalize, value: count, color: status_colors[status] || '#6b7280' }
        end
      end

      def revenue_by_month(business_ids)
        6.times.map do |i|
          month = i.months.ago
          revenue = Payment.where(business_id: business_ids)
                           .where(status: 'completed')
                           .where(created_at: month.beginning_of_month..month.end_of_month)
                           .sum(:amount_cents) / 100
          { month: month.strftime('%b'), revenue: revenue }
        end.reverse
      end

      def revenue_by_service(business_ids, date_range)
        Booking.where(business_id: business_ids)
               .where(start_at: date_range)
               .where(status: 'completed')
               .joins(:service)
               .group('services.name')
               .sum(:total_amount_cents)
               .map { |name, cents| { service: name, revenue: cents / 100 } }
               .sort_by { |h| -h[:revenue] }
               .first(5)
      end

      def payment_methods(payments)
        payments.group(:payment_method).sum(:amount_cents).map do |method, cents|
          { name: method&.titleize || 'Unknown', value: cents / 100 }
        end
      end

      def top_staff(bookings)
        bookings.where.not(staff_member_id: nil)
                .joins(staff_member: :user)
                .group('users.first_name', 'users.last_name')
                .select('users.first_name, users.last_name, COUNT(*) as booking_count, SUM(bookings.total_amount_cents) as total_revenue')
                .order('booking_count DESC')
                .limit(5)
                .map do |record|
                  {
                    name: "#{record.first_name} #{record.last_name}",
                    bookings: record.booking_count,
                    revenue: record.total_revenue.to_i / 100
                  }
                end
      end

      def peak_hours(bookings)
        hour_counts = bookings.group_by { |b| b.start_at.hour }
                              .transform_values(&:count)
        
        max_count = hour_counts.values.max || 1
        
        hour_counts.sort_by { |_, count| -count }
                   .first(5)
                   .map do |hour, count|
                     {
                       time: "#{hour % 12 == 0 ? 12 : hour % 12}:00 #{hour < 12 ? 'AM' : 'PM'} - #{(hour + 1) % 12 == 0 ? 12 : (hour + 1) % 12}:00 #{hour + 1 < 12 ? 'AM' : 'PM'}",
                       bookings: count,
                       percentage: (count.to_f / max_count * 100).round(0)
                     }
                   end
      end

      def booking_sources(bookings)
        source_counts = bookings.group(:source).count
        total = source_counts.values.sum
        
        source_counts.map do |source, count|
          {
            source: source&.titleize || 'Unknown',
            count: count,
            percentage: total > 0 ? (count.to_f / total * 100).round(0) : 0
          }
        end.sort_by { |h| -h[:count] }
      end

      def staff_utilization(business_ids, date_range)
        StaffMember.where(business_id: business_ids)
                   .where(is_bookable: true)
                   .includes(:user)
                   .map do |staff|
                     bookings = staff.bookings.where(start_at: date_range)
                     total_minutes = bookings.sum(:duration_minutes)
                     # Assume 8 hours/day, 5 days/week working
                     days_in_range = ((date_range.end - date_range.begin) / 1.day).to_i
                     working_days = (days_in_range * 5.0 / 7).ceil
                     available_minutes = working_days * 8 * 60
                     utilization = available_minutes > 0 ? (total_minutes.to_f / available_minutes * 100).round(0) : 0
                     
                     {
                       name: staff.user.full_name,
                       utilization: [utilization, 100].min
                     }
                   end.sort_by { |h| -h[:utilization] }
      end
    end
  end
end
