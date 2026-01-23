class WaitlistExpirationJob < ApplicationJob
  queue_as :waitlist

  def perform(waitlist_entry_id)
    entry = WaitlistEntry.find_by(id: waitlist_entry_id)
    return unless entry
    return unless entry.notified?

    ActsAsTenant.with_tenant(entry.tenant) do
      entry.expire!
    end
  end
end
