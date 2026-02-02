# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_01_29_120000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "active_admin_comments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "namespace"
    t.text "body"
    t.string "resource_type"
    t.uuid "resource_id"
    t.string "author_type"
    t.uuid "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author"
    t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
    t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource"
  end

  create_table "admin_users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "api_keys", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "business_id"
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.string "key_digest", null: false
    t.string "key_prefix", null: false
    t.jsonb "scopes", default: []
    t.string "status", default: "active", null: false
    t.datetime "last_used_at"
    t.datetime "expires_at"
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id"], name: "index_api_keys_on_business_id"
    t.index ["key_digest"], name: "index_api_keys_on_key_digest", unique: true
    t.index ["key_prefix"], name: "index_api_keys_on_key_prefix"
    t.index ["status"], name: "index_api_keys_on_status"
    t.index ["tenant_id"], name: "index_api_keys_on_tenant_id"
    t.index ["user_id"], name: "index_api_keys_on_user_id"
  end

  create_table "audit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "user_id"
    t.string "auditable_type"
    t.uuid "auditable_id"
    t.string "action", null: false
    t.jsonb "audited_changes", default: {}
    t.jsonb "metadata", default: {}
    t.string "ip_address"
    t.string "user_agent"
    t.string "request_id"
    t.datetime "created_at", null: false
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["auditable_type", "auditable_id"], name: "index_audit_logs_on_auditable_type_and_auditable_id"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
    t.index ["tenant_id", "created_at"], name: "index_audit_logs_on_tenant_id_and_created_at"
    t.index ["tenant_id"], name: "index_audit_logs_on_tenant_id"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
  end

  create_table "availability_rules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "staff_member_id"
    t.uuid "location_id"
    t.uuid "business_id", null: false
    t.string "rule_type", null: false
    t.string "name"
    t.integer "day_of_week"
    t.date "specific_date"
    t.time "start_time"
    t.time "end_time"
    t.boolean "is_available", default: true
    t.boolean "is_recurring", default: true
    t.date "recurrence_start_date"
    t.date "recurrence_end_date"
    t.jsonb "recurrence_pattern", default: {}
    t.integer "priority", default: 0
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id"], name: "index_availability_rules_on_business_id"
    t.index ["discarded_at"], name: "index_availability_rules_on_discarded_at"
    t.index ["location_id", "day_of_week"], name: "index_availability_rules_on_location_id_and_day_of_week"
    t.index ["location_id"], name: "index_availability_rules_on_location_id"
    t.index ["rule_type"], name: "index_availability_rules_on_rule_type"
    t.index ["staff_member_id", "day_of_week"], name: "index_availability_rules_on_staff_member_id_and_day_of_week"
    t.index ["staff_member_id", "specific_date"], name: "index_availability_rules_on_staff_member_id_and_specific_date"
    t.index ["staff_member_id"], name: "index_availability_rules_on_staff_member_id"
    t.index ["tenant_id"], name: "index_availability_rules_on_tenant_id"
  end

  create_table "booking_attendees", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "booking_id", null: false
    t.uuid "user_id"
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "status", default: "confirmed"
    t.boolean "is_primary", default: false
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id", "email"], name: "index_booking_attendees_on_booking_id_and_email"
    t.index ["booking_id"], name: "index_booking_attendees_on_booking_id"
    t.index ["user_id"], name: "index_booking_attendees_on_user_id"
  end

  create_table "bookings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "business_id", null: false
    t.uuid "location_id"
    t.uuid "service_id", null: false
    t.uuid "staff_member_id"
    t.uuid "client_id", null: false
    t.uuid "booked_by_id"
    t.uuid "parent_booking_id"
    t.string "confirmation_code", null: false
    t.string "status", default: "pending", null: false
    t.string "booking_type", default: "single", null: false
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.integer "duration_minutes", null: false
    t.integer "total_amount_cents", default: 0, null: false
    t.integer "deposit_amount_cents", default: 0, null: false
    t.integer "paid_amount_cents", default: 0, null: false
    t.string "payment_status", default: "unpaid"
    t.text "client_notes"
    t.text "staff_notes"
    t.text "internal_notes"
    t.text "cancellation_reason"
    t.datetime "cancelled_at"
    t.uuid "cancelled_by_id"
    t.datetime "confirmed_at"
    t.datetime "completed_at"
    t.datetime "no_show_at"
    t.string "source", default: "web"
    t.string "external_calendar_event_id"
    t.jsonb "intake_form_responses", default: {}
    t.jsonb "metadata", default: {}
    t.boolean "is_recurring", default: false
    t.string "recurrence_rule"
    t.integer "attendee_count", default: 1
    t.string "video_meeting_url"
    t.datetime "reminder_sent_at"
    t.datetime "follow_up_sent_at"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booked_by_id"], name: "index_bookings_on_booked_by_id"
    t.index ["business_id", "start_at"], name: "index_bookings_on_business_id_and_start_at"
    t.index ["business_id"], name: "index_bookings_on_business_id"
    t.index ["cancelled_by_id"], name: "index_bookings_on_cancelled_by_id"
    t.index ["client_id", "start_at"], name: "index_bookings_on_client_id_and_start_at"
    t.index ["client_id"], name: "index_bookings_on_client_id"
    t.index ["confirmation_code"], name: "index_bookings_on_confirmation_code", unique: true
    t.index ["discarded_at"], name: "index_bookings_on_discarded_at"
    t.index ["external_calendar_event_id"], name: "index_bookings_on_external_calendar_event_id"
    t.index ["location_id"], name: "index_bookings_on_location_id"
    t.index ["parent_booking_id"], name: "index_bookings_on_parent_booking_id"
    t.index ["payment_status"], name: "index_bookings_on_payment_status"
    t.index ["service_id"], name: "index_bookings_on_service_id"
    t.index ["staff_member_id", "start_at"], name: "index_bookings_on_staff_member_id_and_start_at"
    t.index ["staff_member_id"], name: "index_bookings_on_staff_member_id"
    t.index ["start_at"], name: "index_bookings_on_start_at"
    t.index ["status"], name: "index_bookings_on_status"
    t.index ["tenant_id"], name: "index_bookings_on_tenant_id"
  end

  create_table "businesses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "owner_id", null: false
    t.string "name", null: false
    t.string "slug", null: false
    t.string "description"
    t.string "industry", null: false
    t.string "status", default: "active", null: false
    t.string "phone"
    t.string "email"
    t.string "website"
    t.string "logo_url"
    t.string "cover_image_url"
    t.string "timezone", null: false
    t.string "currency", default: "USD", null: false
    t.string "country_code"
    t.jsonb "settings", default: {}
    t.jsonb "booking_settings", default: {}
    t.jsonb "notification_settings", default: {}
    t.jsonb "payment_settings", default: {}
    t.jsonb "social_links", default: {}
    t.integer "booking_lead_time_minutes", default: 60
    t.integer "booking_window_days", default: 30
    t.integer "cancellation_policy_hours", default: 24
    t.boolean "requires_payment", default: false
    t.boolean "auto_confirm_bookings", default: true
    t.boolean "allow_waitlist", default: true
    t.decimal "deposit_percentage", precision: 5, scale: 2, default: "0.0"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["discarded_at"], name: "index_businesses_on_discarded_at"
    t.index ["industry"], name: "index_businesses_on_industry"
    t.index ["owner_id"], name: "index_businesses_on_owner_id"
    t.index ["slug"], name: "index_businesses_on_slug", unique: true
    t.index ["status"], name: "index_businesses_on_status"
    t.index ["tenant_id"], name: "index_businesses_on_tenant_id"
  end

  create_table "calendar_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "calendar_integration_id", null: false
    t.uuid "booking_id"
    t.string "external_event_id", null: false
    t.string "status", default: "active"
    t.string "title"
    t.text "description"
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.boolean "is_all_day", default: false
    t.boolean "is_blocking", default: true
    t.string "location"
    t.jsonb "attendees", default: []
    t.jsonb "raw_data", default: {}
    t.datetime "synced_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_calendar_events_on_booking_id"
    t.index ["calendar_integration_id", "external_event_id"], name: "idx_calendar_events_integration_external", unique: true
    t.index ["calendar_integration_id", "start_at", "end_at"], name: "idx_calendar_events_time_range"
    t.index ["calendar_integration_id"], name: "index_calendar_events_on_calendar_integration_id"
    t.index ["tenant_id"], name: "index_calendar_events_on_tenant_id"
  end

  create_table "calendar_integrations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "user_id", null: false
    t.uuid "staff_member_id"
    t.string "provider", null: false
    t.string "status", default: "active", null: false
    t.string "calendar_id"
    t.string "calendar_name"
    t.text "encrypted_access_token"
    t.text "encrypted_refresh_token"
    t.datetime "token_expires_at"
    t.string "sync_direction", default: "bidirectional"
    t.boolean "sync_availability", default: true
    t.boolean "sync_bookings", default: true
    t.boolean "block_external_events", default: true
    t.jsonb "sync_settings", default: {}
    t.datetime "last_synced_at"
    t.datetime "last_sync_error_at"
    t.text "last_sync_error"
    t.string "webhook_channel_id"
    t.datetime "webhook_expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["provider"], name: "index_calendar_integrations_on_provider"
    t.index ["staff_member_id"], name: "index_calendar_integrations_on_staff_member_id"
    t.index ["status"], name: "index_calendar_integrations_on_status"
    t.index ["tenant_id"], name: "index_calendar_integrations_on_tenant_id"
    t.index ["user_id", "provider"], name: "index_calendar_integrations_on_user_id_and_provider", unique: true
    t.index ["user_id"], name: "index_calendar_integrations_on_user_id"
  end

  create_table "feature_flags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.string "name", null: false
    t.string "description"
    t.boolean "enabled", default: false
    t.jsonb "rules", default: {}
    t.integer "percentage", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "name"], name: "index_feature_flags_on_tenant_id_and_name", unique: true
    t.index ["tenant_id"], name: "index_feature_flags_on_tenant_id"
  end

  create_table "flipper_features", force: :cascade do |t|
    t.string "key", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_flipper_features_on_key", unique: true
  end

  create_table "flipper_gates", force: :cascade do |t|
    t.string "feature_key", null: false
    t.string "key", null: false
    t.text "value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["feature_key", "key", "value"], name: "index_flipper_gates_on_feature_key_and_key_and_value", unique: true
  end

  create_table "intake_form_responses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "intake_form_id", null: false
    t.uuid "booking_id"
    t.uuid "client_id", null: false
    t.jsonb "responses", default: {}
    t.jsonb "encrypted_responses", default: {}
    t.datetime "submitted_at"
    t.string "status", default: "draft"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_intake_form_responses_on_booking_id"
    t.index ["client_id"], name: "index_intake_form_responses_on_client_id"
    t.index ["intake_form_id", "client_id"], name: "index_intake_form_responses_on_intake_form_id_and_client_id"
    t.index ["intake_form_id"], name: "index_intake_form_responses_on_intake_form_id"
    t.index ["status"], name: "index_intake_form_responses_on_status"
    t.index ["tenant_id"], name: "index_intake_form_responses_on_tenant_id"
  end

  create_table "intake_forms", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "business_id", null: false
    t.uuid "service_id"
    t.string "name", null: false
    t.text "description"
    t.string "status", default: "active", null: false
    t.boolean "is_required", default: false
    t.jsonb "fields", default: []
    t.jsonb "conditional_logic", default: {}
    t.integer "sort_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id", "name"], name: "index_intake_forms_on_business_id_and_name"
    t.index ["business_id"], name: "index_intake_forms_on_business_id"
    t.index ["service_id"], name: "index_intake_forms_on_service_id"
    t.index ["status"], name: "index_intake_forms_on_status"
    t.index ["tenant_id"], name: "index_intake_forms_on_tenant_id"
  end

  create_table "invoices", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "business_id", null: false
    t.uuid "client_id", null: false
    t.uuid "booking_id"
    t.string "invoice_number", null: false
    t.string "status", default: "draft", null: false
    t.integer "subtotal_cents", default: 0, null: false
    t.integer "tax_amount_cents", default: 0, null: false
    t.integer "discount_amount_cents", default: 0, null: false
    t.integer "total_amount_cents", default: 0, null: false
    t.integer "paid_amount_cents", default: 0, null: false
    t.string "currency", default: "USD", null: false
    t.date "issue_date"
    t.date "due_date"
    t.datetime "paid_at"
    t.text "notes"
    t.text "terms"
    t.jsonb "line_items", default: []
    t.jsonb "tax_details", default: {}
    t.jsonb "insurance_info", default: {}
    t.boolean "is_insurance_claim", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_invoices_on_booking_id"
    t.index ["business_id", "invoice_number"], name: "index_invoices_on_business_id_and_invoice_number", unique: true
    t.index ["business_id"], name: "index_invoices_on_business_id"
    t.index ["client_id"], name: "index_invoices_on_client_id"
    t.index ["due_date"], name: "index_invoices_on_due_date"
    t.index ["status"], name: "index_invoices_on_status"
    t.index ["tenant_id"], name: "index_invoices_on_tenant_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "exp", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti", unique: true
  end

  create_table "locations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "business_id", null: false
    t.string "name", null: false
    t.string "address_line1"
    t.string "address_line2"
    t.string "city"
    t.string "state"
    t.string "postal_code"
    t.string "country_code"
    t.decimal "latitude", precision: 10, scale: 8
    t.decimal "longitude", precision: 11, scale: 8
    t.string "phone"
    t.string "email"
    t.string "timezone", null: false
    t.string "status", default: "active", null: false
    t.boolean "is_primary", default: false
    t.boolean "is_virtual", default: false
    t.string "virtual_meeting_url"
    t.jsonb "operating_hours", default: {}
    t.jsonb "settings", default: {}
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id", "is_primary"], name: "index_locations_on_business_id_and_is_primary"
    t.index ["business_id"], name: "index_locations_on_business_id"
    t.index ["discarded_at"], name: "index_locations_on_discarded_at"
    t.index ["latitude", "longitude"], name: "index_locations_on_latitude_and_longitude"
    t.index ["status"], name: "index_locations_on_status"
    t.index ["tenant_id"], name: "index_locations_on_tenant_id"
  end

  create_table "notification_preferences", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "notification_type", null: false
    t.boolean "email_enabled", default: true
    t.boolean "sms_enabled", default: true
    t.boolean "push_enabled", default: true
    t.boolean "in_app_enabled", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "notification_type"], name: "idx_on_user_id_notification_type_2ab4363e9b", unique: true
    t.index ["user_id"], name: "index_notification_preferences_on_user_id"
  end

  create_table "notification_templates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "business_id"
    t.string "name", null: false
    t.string "template_type", null: false
    t.string "channel", null: false
    t.string "subject"
    t.text "body", null: false
    t.jsonb "variables", default: []
    t.boolean "is_active", default: true
    t.boolean "is_system", default: false
    t.string "locale", default: "en"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id", "template_type", "channel", "locale"], name: "idx_notification_templates_unique", unique: true
    t.index ["business_id"], name: "index_notification_templates_on_business_id"
    t.index ["is_system"], name: "index_notification_templates_on_is_system"
    t.index ["tenant_id"], name: "index_notification_templates_on_tenant_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "user_id", null: false
    t.uuid "booking_id"
    t.string "notification_type", null: false
    t.string "channel", null: false
    t.string "status", default: "pending", null: false
    t.string "subject"
    t.text "body"
    t.string "recipient_email"
    t.string "recipient_phone"
    t.string "provider_message_id"
    t.jsonb "provider_response", default: {}
    t.jsonb "metadata", default: {}
    t.datetime "scheduled_for"
    t.datetime "sent_at"
    t.datetime "delivered_at"
    t.datetime "read_at"
    t.datetime "failed_at"
    t.text "failure_reason"
    t.integer "retry_count", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_notifications_on_booking_id"
    t.index ["channel"], name: "index_notifications_on_channel"
    t.index ["notification_type"], name: "index_notifications_on_notification_type"
    t.index ["scheduled_for"], name: "index_notifications_on_scheduled_for"
    t.index ["status"], name: "index_notifications_on_status"
    t.index ["tenant_id"], name: "index_notifications_on_tenant_id"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "booking_id"
    t.uuid "user_id", null: false
    t.uuid "business_id", null: false
    t.string "payment_type", null: false
    t.string "status", default: "pending", null: false
    t.string "provider", null: false
    t.string "provider_payment_id"
    t.string "provider_customer_id"
    t.integer "amount_cents", default: 0, null: false
    t.integer "refunded_amount_cents", default: 0, null: false
    t.integer "fee_amount_cents", default: 0, null: false
    t.string "currency", default: "USD", null: false
    t.string "payment_method"
    t.string "card_last_four"
    t.string "card_brand"
    t.text "failure_reason"
    t.jsonb "provider_response", default: {}
    t.jsonb "metadata", default: {}
    t.datetime "paid_at"
    t.datetime "refunded_at"
    t.datetime "failed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_payments_on_booking_id"
    t.index ["business_id", "created_at"], name: "index_payments_on_business_id_and_created_at"
    t.index ["business_id"], name: "index_payments_on_business_id"
    t.index ["payment_type"], name: "index_payments_on_payment_type"
    t.index ["provider_payment_id"], name: "index_payments_on_provider_payment_id"
    t.index ["status"], name: "index_payments_on_status"
    t.index ["tenant_id"], name: "index_payments_on_tenant_id"
    t.index ["user_id"], name: "index_payments_on_user_id"
  end

  create_table "refunds", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "payment_id", null: false
    t.uuid "processed_by_id"
    t.string "status", default: "pending", null: false
    t.integer "amount_cents", default: 0, null: false
    t.string "reason"
    t.string "provider_refund_id"
    t.jsonb "provider_response", default: {}
    t.datetime "processed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["payment_id"], name: "index_refunds_on_payment_id"
    t.index ["processed_by_id"], name: "index_refunds_on_processed_by_id"
    t.index ["provider_refund_id"], name: "index_refunds_on_provider_refund_id"
    t.index ["status"], name: "index_refunds_on_status"
    t.index ["tenant_id"], name: "index_refunds_on_tenant_id"
  end

  create_table "services", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "business_id", null: false
    t.uuid "category_id"
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.string "service_type", default: "appointment", null: false
    t.string "status", default: "active", null: false
    t.integer "duration_minutes", null: false
    t.integer "buffer_before_minutes", default: 0
    t.integer "buffer_after_minutes", default: 0
    t.integer "max_attendees", default: 1
    t.integer "min_attendees", default: 1
    t.integer "price_cents", default: 0, null: false
    t.integer "deposit_amount_cents", default: 0, null: false
    t.string "color"
    t.string "image_url"
    t.boolean "is_category", default: false
    t.boolean "is_public", default: true
    t.boolean "requires_confirmation", default: false
    t.boolean "allow_online_booking", default: true
    t.boolean "allow_waitlist", default: true
    t.jsonb "settings", default: {}
    t.jsonb "intake_form_config", default: {}
    t.integer "sort_order", default: 0
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id", "slug"], name: "index_services_on_business_id_and_slug", unique: true
    t.index ["business_id"], name: "index_services_on_business_id"
    t.index ["category_id"], name: "index_services_on_category_id"
    t.index ["discarded_at"], name: "index_services_on_discarded_at"
    t.index ["is_category"], name: "index_services_on_is_category"
    t.index ["is_public"], name: "index_services_on_is_public"
    t.index ["service_type"], name: "index_services_on_service_type"
    t.index ["status"], name: "index_services_on_status"
    t.index ["tenant_id"], name: "index_services_on_tenant_id"
  end

  create_table "staff_members", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.uuid "business_id", null: false
    t.uuid "user_id", null: false
    t.uuid "location_id"
    t.string "title"
    t.string "bio"
    t.string "status", default: "active", null: false
    t.string "role", default: "staff", null: false
    t.string "color"
    t.string "avatar_url"
    t.jsonb "skills", default: []
    t.jsonb "settings", default: {}
    t.boolean "accepts_new_clients", default: true
    t.boolean "is_bookable", default: true
    t.integer "max_daily_bookings"
    t.integer "sort_order", default: 0
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id", "user_id"], name: "index_staff_members_on_business_id_and_user_id", unique: true
    t.index ["business_id"], name: "index_staff_members_on_business_id"
    t.index ["discarded_at"], name: "index_staff_members_on_discarded_at"
    t.index ["is_bookable"], name: "index_staff_members_on_is_bookable"
    t.index ["location_id"], name: "index_staff_members_on_location_id"
    t.index ["status"], name: "index_staff_members_on_status"
    t.index ["tenant_id"], name: "index_staff_members_on_tenant_id"
    t.index ["user_id"], name: "index_staff_members_on_user_id"
  end

  create_table "staff_services", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "staff_member_id", null: false
    t.uuid "service_id", null: false
    t.integer "custom_price_cents", default: 0, null: false
    t.integer "custom_duration_minutes"
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_id"], name: "index_staff_services_on_service_id"
    t.index ["staff_member_id", "service_id"], name: "index_staff_services_on_staff_member_id_and_service_id", unique: true
    t.index ["staff_member_id"], name: "index_staff_services_on_staff_member_id"
  end

  create_table "tenants", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "subdomain", null: false
    t.string "custom_domain"
    t.string "industry", null: false
    t.string "status", default: "active", null: false
    t.string "plan", default: "free", null: false
    t.string "timezone", default: "UTC", null: false
    t.string "currency", default: "USD", null: false
    t.string "country_code", default: "US"
    t.string "locale", default: "en"
    t.jsonb "settings", default: {}
    t.jsonb "branding", default: {}
    t.jsonb "features", default: {}
    t.boolean "hipaa_enabled", default: false
    t.boolean "gdpr_enabled", default: false
    t.datetime "trial_ends_at"
    t.datetime "subscription_ends_at"
    t.datetime "discarded_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["custom_domain"], name: "index_tenants_on_custom_domain", unique: true, where: "(custom_domain IS NOT NULL)"
    t.index ["discarded_at"], name: "index_tenants_on_discarded_at"
    t.index ["industry"], name: "index_tenants_on_industry"
    t.index ["status"], name: "index_tenants_on_status"
    t.index ["subdomain"], name: "index_tenants_on_subdomain", unique: true
  end

  create_table "time_off_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "staff_member_id", null: false
    t.string "status", default: "pending", null: false
    t.string "reason"
    t.text "notes"
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.boolean "is_all_day", default: false
    t.uuid "approved_by_id"
    t.datetime "approved_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["approved_by_id"], name: "index_time_off_requests_on_approved_by_id"
    t.index ["staff_member_id", "start_at", "end_at"], name: "idx_on_staff_member_id_start_at_end_at_88ba8e1677"
    t.index ["staff_member_id"], name: "index_time_off_requests_on_staff_member_id"
    t.index ["status"], name: "index_time_off_requests_on_status"
    t.index ["tenant_id"], name: "index_time_off_requests_on_tenant_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id"
    t.string "email", null: false
    t.string "encrypted_password", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "phone"
    t.string "phone_country_code"
    t.string "role", default: "client", null: false
    t.string "status", default: "active", null: false
    t.string "avatar_url"
    t.string "timezone"
    t.string "locale", default: "en"
    t.jsonb "preferences", default: {}
    t.jsonb "metadata", default: {}
    t.text "encrypted_ssn"
    t.string "encrypted_ssn_bidx"
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.datetime "discarded_at"
    t.datetime "last_activity_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["encrypted_ssn_bidx"], name: "index_users_on_encrypted_ssn_bidx"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["status"], name: "index_users_on_status"
    t.index ["tenant_id"], name: "index_users_on_tenant_id"
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type", null: false
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object"
    t.text "object_changes"
    t.datetime "created_at"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  create_table "waitlist_entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "business_id", null: false
    t.uuid "service_id", null: false
    t.uuid "staff_member_id"
    t.uuid "client_id", null: false
    t.date "preferred_date"
    t.time "preferred_time_start"
    t.time "preferred_time_end"
    t.jsonb "preferred_days", default: []
    t.string "status", default: "waiting", null: false
    t.text "notes"
    t.datetime "notified_at"
    t.datetime "expires_at"
    t.integer "priority", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id"], name: "index_waitlist_entries_on_business_id"
    t.index ["client_id"], name: "index_waitlist_entries_on_client_id"
    t.index ["service_id", "status"], name: "index_waitlist_entries_on_service_id_and_status"
    t.index ["service_id"], name: "index_waitlist_entries_on_service_id"
    t.index ["staff_member_id", "status"], name: "index_waitlist_entries_on_staff_member_id_and_status"
    t.index ["staff_member_id"], name: "index_waitlist_entries_on_staff_member_id"
    t.index ["status"], name: "index_waitlist_entries_on_status"
    t.index ["tenant_id"], name: "index_waitlist_entries_on_tenant_id"
  end

  create_table "webhook_deliveries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "webhook_id", null: false
    t.string "event_type", null: false
    t.jsonb "payload", default: {}
    t.string "status", default: "pending", null: false
    t.integer "response_code"
    t.text "response_body"
    t.integer "attempt_count", default: 0
    t.datetime "delivered_at"
    t.datetime "next_retry_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["next_retry_at"], name: "index_webhook_deliveries_on_next_retry_at"
    t.index ["status"], name: "index_webhook_deliveries_on_status"
    t.index ["webhook_id"], name: "index_webhook_deliveries_on_webhook_id"
  end

  create_table "webhooks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "tenant_id", null: false
    t.uuid "business_id"
    t.string "url", null: false
    t.string "secret_digest"
    t.jsonb "events", default: []
    t.string "status", default: "active", null: false
    t.integer "failure_count", default: 0
    t.datetime "last_triggered_at"
    t.datetime "last_success_at"
    t.datetime "last_failure_at"
    t.text "last_failure_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["business_id"], name: "index_webhooks_on_business_id"
    t.index ["status"], name: "index_webhooks_on_status"
    t.index ["tenant_id"], name: "index_webhooks_on_tenant_id"
  end

  add_foreign_key "api_keys", "businesses"
  add_foreign_key "api_keys", "tenants"
  add_foreign_key "api_keys", "users"
  add_foreign_key "audit_logs", "tenants"
  add_foreign_key "audit_logs", "users"
  add_foreign_key "availability_rules", "businesses"
  add_foreign_key "availability_rules", "locations"
  add_foreign_key "availability_rules", "staff_members"
  add_foreign_key "availability_rules", "tenants"
  add_foreign_key "booking_attendees", "bookings"
  add_foreign_key "booking_attendees", "users"
  add_foreign_key "bookings", "bookings", column: "parent_booking_id"
  add_foreign_key "bookings", "businesses"
  add_foreign_key "bookings", "locations"
  add_foreign_key "bookings", "services"
  add_foreign_key "bookings", "staff_members"
  add_foreign_key "bookings", "tenants"
  add_foreign_key "bookings", "users", column: "booked_by_id"
  add_foreign_key "bookings", "users", column: "cancelled_by_id"
  add_foreign_key "bookings", "users", column: "client_id"
  add_foreign_key "businesses", "tenants"
  add_foreign_key "businesses", "users", column: "owner_id"
  add_foreign_key "calendar_events", "bookings"
  add_foreign_key "calendar_events", "calendar_integrations"
  add_foreign_key "calendar_events", "tenants"
  add_foreign_key "calendar_integrations", "staff_members"
  add_foreign_key "calendar_integrations", "tenants"
  add_foreign_key "calendar_integrations", "users"
  add_foreign_key "feature_flags", "tenants"
  add_foreign_key "intake_form_responses", "bookings"
  add_foreign_key "intake_form_responses", "intake_forms"
  add_foreign_key "intake_form_responses", "tenants"
  add_foreign_key "intake_form_responses", "users", column: "client_id"
  add_foreign_key "intake_forms", "businesses"
  add_foreign_key "intake_forms", "services"
  add_foreign_key "intake_forms", "tenants"
  add_foreign_key "invoices", "bookings"
  add_foreign_key "invoices", "businesses"
  add_foreign_key "invoices", "tenants"
  add_foreign_key "invoices", "users", column: "client_id"
  add_foreign_key "locations", "businesses"
  add_foreign_key "locations", "tenants"
  add_foreign_key "notification_preferences", "users"
  add_foreign_key "notification_templates", "businesses"
  add_foreign_key "notification_templates", "tenants"
  add_foreign_key "notifications", "bookings"
  add_foreign_key "notifications", "tenants"
  add_foreign_key "notifications", "users"
  add_foreign_key "payments", "bookings"
  add_foreign_key "payments", "businesses"
  add_foreign_key "payments", "tenants"
  add_foreign_key "payments", "users"
  add_foreign_key "refunds", "payments"
  add_foreign_key "refunds", "tenants"
  add_foreign_key "refunds", "users", column: "processed_by_id"
  add_foreign_key "services", "businesses"
  add_foreign_key "services", "services", column: "category_id"
  add_foreign_key "services", "tenants"
  add_foreign_key "staff_members", "businesses"
  add_foreign_key "staff_members", "locations"
  add_foreign_key "staff_members", "tenants"
  add_foreign_key "staff_members", "users"
  add_foreign_key "staff_services", "services"
  add_foreign_key "staff_services", "staff_members"
  add_foreign_key "time_off_requests", "staff_members"
  add_foreign_key "time_off_requests", "tenants"
  add_foreign_key "time_off_requests", "users", column: "approved_by_id"
  add_foreign_key "users", "tenants"
  add_foreign_key "waitlist_entries", "businesses"
  add_foreign_key "waitlist_entries", "services"
  add_foreign_key "waitlist_entries", "staff_members"
  add_foreign_key "waitlist_entries", "tenants"
  add_foreign_key "waitlist_entries", "users", column: "client_id"
  add_foreign_key "webhook_deliveries", "webhooks"
  add_foreign_key "webhooks", "businesses"
  add_foreign_key "webhooks", "tenants"
end
