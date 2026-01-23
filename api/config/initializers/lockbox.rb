Lockbox.master_key = ENV.fetch('LOCKBOX_MASTER_KEY') { Rails.application.credentials.lockbox_master_key || SecureRandom.hex(32) }
