class WebhookDeliveryJob < ApplicationJob
  queue_as :webhooks

  def perform(webhook_delivery_id)
    delivery = WebhookDelivery.find_by(id: webhook_delivery_id)
    return unless delivery
    return unless delivery.pending? || delivery.can_retry?

    deliver_webhook(delivery)
  end

  private

  def deliver_webhook(delivery)
    delivery.mark_processing!

    webhook = delivery.webhook
    payload = delivery.payload

    signature = webhook.sign_payload(payload)

    response = HTTP.timeout(30)
                   .headers(
                     'Content-Type' => 'application/json',
                     'X-Webhook-Signature' => signature,
                     'X-Webhook-Event' => delivery.event_type,
                     'X-Webhook-Delivery-ID' => delivery.id.to_s
                   )
                   .post(webhook.url, json: payload)

    if response.status.success?
      delivery.mark_delivered!(response.status.code, response.body.to_s)
    else
      delivery.mark_failed!(response.status.code, response.body.to_s)
    end
  rescue HTTP::Error, Timeout::Error => e
    delivery.mark_failed!(0, e.message)
  end
end
