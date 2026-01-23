MoneyRails.configure do |config|
  config.default_currency = :usd
  config.rounding_mode = BigDecimal::ROUND_HALF_UP
  
  config.register_currency = {
    priority: 1,
    iso_code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    symbol_first: true,
    subunit: "Paisa",
    subunit_to_unit: 100,
    thousands_separator: ",",
    decimal_mark: "."
  }
end
