# User Story 4: Product Metadata Management

**ID**: US4  
**Priority**: P1  
**Status**: Specified  
**Created**: 2025-11-24  
**Dependencies**: US1 (Import Product)

---

## User Story

**As a** store administrator  
**I want to** add detailed technical metadata to imported products  
**So that** customers can filter and compare products by technical specifications

---

## Background

After importing products from Amazon PA-API, we get basic product information (title, price, images, description). However, for technical products like ESP32 development boards and sensors, customers need detailed technical specifications to make informed purchasing decisions.

The metadata system needs to be:
- **Type-specific**: Different product types have different metadata fields
- **Flexible**: Easy to add new product types and metadata fields
- **Searchable**: Enable filtering and comparison by specifications
- **Manual entry**: Metadata requires domain expertise and cannot be reliably extracted from PA-API data

---

## Success Criteria

1. ✅ **Database schema supports type-specific metadata** (JSONB column with validation)
2. ✅ **Admin can add/edit metadata for each product** via API or UI
3. ✅ **Metadata is validated** based on product type schema
4. ✅ **Products can be filtered** by metadata fields (e.g., "ESP32-S3 with PSRAM ≥ 8MB")
5. ✅ **Metadata changes are tracked** (audit log or version history)

---

## Acceptance Tests

### Test 1: Add Metadata to ESP32 Development Board
```gherkin
GIVEN a product with ASIN "B08DQQ8CBP" is imported
WHEN admin sets metadata:
  - product_type: "development_board"
  - chip: "ESP32-S3"
  - psram: "8MB"
  - flash: "16MB"
  - wifi: "802.11 b/g/n"
  - bluetooth: "BLE 5.0"
  - zigbee: false
  - battery_connector: true
  - camera_connector: true
THEN metadata is saved to database
AND product can be filtered by "chip = ESP32-S3"
AND product can be filtered by "psram >= 8MB"
```

### Test 2: Add Metadata to Environmental Sensor
```gherkin
GIVEN a product with ASIN "B07XYZ1234" is imported (BME680 sensor)
WHEN admin sets metadata:
  - product_type: "sensor"
  - sensor_types: ["temperature", "humidity", "pressure", "gas"]
  - temperature_range: "-40°C to 85°C"
  - humidity_range: "0% to 100%"
  - interface: "I2C"
  - voltage: "3.3V"
THEN metadata is saved to database
AND product can be filtered by "sensor_types contains temperature"
AND product can be filtered by "interface = I2C"
```

### Test 3: Validate Metadata Against Schema
```gherkin
GIVEN a product with product_type "development_board"
WHEN admin attempts to set metadata with invalid chip value "InvalidChip"
THEN API returns 400 Bad Request
AND error message indicates "chip must be one of: ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, ESP32-H2"
```

---

## Metadata Structure

To enable efficient filtering and querying, metadata uses a **dual-structure design**:

1. **`display`**: Human-readable values for UI display (e.g., "8MB PSRAM", "802.11 b/g/n")
2. **`filters`**: Normalized, machine-readable values for database queries (e.g., `psram_mb: 8`, `wifi_standards: ["802.11n"]`)

This approach provides:
- ✅ Fast range queries (numeric comparisons)
- ✅ Efficient array containment searches
- ✅ Type-safe boolean filters
- ✅ No string parsing overhead
- ✅ Indexed fields for common filters

---

## Product Type Schemas

### 1. Development Board (`development_board`)

**Display Fields** (human-readable):
- `product_type` (string): "Development Board"
- `chip` (string): "ESP32-S3", "ESP32-C6", etc.
- `psram` (string): "8MB PSRAM", "No PSRAM"
- `flash` (string): "16MB Flash"
- `wifi` (string): "802.11 b/g/n"
- `bluetooth` (string): "BLE 5.0"
- `zigbee` (string): "Yes" / "No"
- `usb` (string): "USB-C"
- `gpio` (string): "36 pins"
- `form_factor` (string): "DevKit", "Mini", etc.

**Filter Fields** (machine-readable):
- `product_type` (enum): "development_board"
- `chip` (enum): "ESP32", "ESP32-S2", "ESP32-S3", "ESP32-C3", "ESP32-C6", "ESP32-H2"
- `chip_series` (enum): "ESP32", "ESP32-S", "ESP32-C", "ESP32-H" (for series-level filtering)
- `psram_mb` (number): 0, 2, 8, 16, 32
- `flash_mb` (number): 4, 8, 16, 32, 64
- `wifi_standards` (array): ["802.11b", "802.11g", "802.11n", "802.11ac", "802.11ax"]
- `wifi_generation` (number): 4 (WiFi 4 = 802.11n), 5 (WiFi 5 = 802.11ac), 6 (WiFi 6 = 802.11ax)
- `bluetooth_version` (number): 4.0, 4.2, 5.0, 5.1, 5.3
- `has_ble` (boolean): true/false
- `has_zigbee` (boolean): true/false
- `has_thread` (boolean): true/false
- `has_battery_connector` (boolean): true/false
- `has_camera_connector` (boolean): true/false
- `has_lcd_connector` (boolean): true/false
- `usb_type` (enum): "micro-usb", "usb-c", "usb-a", "none"
- `gpio_pins` (number): 0-50
- `form_factor` (enum): "devkit", "mini", "pico", "wrover", "wroom"
- `operating_voltage_v` (number): 3.3, 5.0

**Example**:
```json
{
  "display": {
    "product_type": "Development Board",
    "chip": "ESP32-S3",
    "psram": "8MB PSRAM",
    "flash": "16MB Flash",
    "wifi": "802.11 b/g/n (WiFi 4)",
    "bluetooth": "BLE 5.0",
    "zigbee": "No",
    "thread": "No",
    "battery_connector": "Yes",
    "camera_connector": "Yes (OV2640 compatible)",
    "lcd_connector": "Yes",
    "usb": "USB-C",
    "gpio": "36 pins",
    "form_factor": "DevKit",
    "operating_voltage": "3.3V"
  },
  "filters": {
    "product_type": "development_board",
    "chip": "ESP32-S3",
    "chip_series": "ESP32-S",
    "psram_mb": 8,
    "flash_mb": 16,
    "wifi_standards": ["802.11b", "802.11g", "802.11n"],
    "wifi_generation": 4,
    "bluetooth_version": 5.0,
    "has_ble": true,
    "has_zigbee": false,
    "has_thread": false,
    "has_battery_connector": true,
    "has_camera_connector": true,
    "has_lcd_connector": true,
    "usb_type": "usb-c",
    "gpio_pins": 36,
    "form_factor": "devkit",
    "operating_voltage_v": 3.3
  }
}
```

---

### 2. Sensor Module (`sensor`)

**Display Fields**:
- `product_type` (string): "Sensor Module"
- `sensors` (string): "Temperature, Humidity, Pressure"
- `temperature_range` (string): "-40°C to 85°C"
- `humidity_range` (string): "0% to 100% RH"
- `pressure_range` (string): "300 to 1100 hPa"
- `interfaces` (string): "I2C, SPI"
- `operating_voltage` (string): "3.3V or 5V"
- `accuracy` (string): "±0.5°C, ±3% RH"
- `response_time` (string): "< 1 second"

**Filter Fields**:
- `product_type` (enum): "sensor"
- `sensor_types` (array): ["temperature", "humidity", "pressure", "gas", "light", "motion", "proximity", "accelerometer", "gyroscope", "magnetometer", "sound", "distance", "color", "uv", "co2", "particulate"]
- `temperature_range_min_c` (number): -40
- `temperature_range_max_c` (number): 85
- `humidity_range_min_pct` (number): 0
- `humidity_range_max_pct` (number): 100
- `pressure_range_min_hpa` (number): 300
- `pressure_range_max_hpa` (number): 1100
- `interfaces` (array): ["i2c", "spi", "uart", "analog", "digital"]
- `operating_voltage_v` (number): 3.3, 5.0
- `voltage_range_min_v` (number): 3.0
- `voltage_range_max_v` (number): 5.5
- `accuracy_percent` (number): 3.0 (for RH)
- `accuracy_degrees_c` (number): 0.5 (for temperature)
- `response_time_ms` (number): 1000

**Example**:
```json
{
  "display": {
    "product_type": "Environmental Sensor",
    "sensors": "Temperature, Humidity, Pressure, Gas (BME680)",
    "temperature_range": "-40°C to 85°C",
    "humidity_range": "0% to 100% RH",
    "pressure_range": "300 to 1100 hPa",
    "interfaces": "I2C, SPI",
    "operating_voltage": "3.3V or 5V",
    "accuracy": "±0.5°C, ±3% RH, ±1 hPa",
    "response_time": "< 1 second"
  },
  "filters": {
    "product_type": "sensor",
    "sensor_types": ["temperature", "humidity", "pressure", "gas"],
    "temperature_range_min_c": -40,
    "temperature_range_max_c": 85,
    "humidity_range_min_pct": 0,
    "humidity_range_max_pct": 100,
    "pressure_range_min_hpa": 300,
    "pressure_range_max_hpa": 1100,
    "interfaces": ["i2c", "spi"],
    "operating_voltage_v": 3.3,
    "voltage_range_min_v": 3.0,
    "voltage_range_max_v": 5.5,
    "accuracy_degrees_c": 0.5,
    "accuracy_percent": 3.0,
    "response_time_ms": 1000
  }
}
```

---

### 3. Display Module (`display`)

**Display Fields**:
- `product_type` (string): "Display Module"
- `display_type` (string): "TFT LCD"
- `screen_size` (string): "3.5 inch"
- `resolution` (string): "480x320 pixels"
- `color_depth` (string): "16-bit (65K colors)"
- `interfaces` (string): "SPI"
- `touchscreen` (string): "Yes (Resistive)"
- `backlight` (string): "LED Backlight"
- `operating_voltage` (string): "3.3V - 5V"

**Filter Fields**:
- `product_type` (enum): "display"
- `display_type` (enum): "lcd", "oled", "e-ink", "tft", "led-matrix"
- `screen_size_inches` (number): 0.96, 1.3, 1.54, 2.4, 2.8, 3.5, 5.0, 7.0
- `resolution_width` (number): 128, 320, 480, 800, 1024
- `resolution_height` (number): 64, 128, 240, 320, 480, 600
- `resolution_total_pixels` (number): 8192, 153600 (calculated: width × height)
- `color_depth_bits` (number): 1 (monochrome), 16, 18, 24
- `is_color` (boolean): true/false
- `interfaces` (array): ["spi", "i2c", "parallel", "hdmi"]
- `has_touchscreen` (boolean): true/false
- `touchscreen_type` (enum): "resistive", "capacitive", "none"
- `has_backlight` (boolean): true/false
- `operating_voltage_v` (number): 3.3, 5.0
- `voltage_range_min_v` (number): 3.0
- `voltage_range_max_v` (number): 5.5

**Example**:
```json
{
  "display": {
    "product_type": "Display Module",
    "display_type": "TFT LCD",
    "screen_size": "3.5 inch diagonal",
    "resolution": "480x320 pixels",
    "color_depth": "16-bit (65K colors)",
    "interfaces": "SPI",
    "touchscreen": "Yes (Resistive)",
    "backlight": "LED Backlight",
    "operating_voltage": "3.3V - 5V"
  },
  "filters": {
    "product_type": "display",
    "display_type": "tft",
    "screen_size_inches": 3.5,
    "resolution_width": 480,
    "resolution_height": 320,
    "resolution_total_pixels": 153600,
    "color_depth_bits": 16,
    "is_color": true,
    "interfaces": ["spi"],
    "has_touchscreen": true,
    "touchscreen_type": "resistive",
    "has_backlight": true,
    "operating_voltage_v": 3.3,
    "voltage_range_min_v": 3.0,
    "voltage_range_max_v": 5.5
  }
}
```

---

### 4. Power Module (`power`)

**Display Fields**:
- `product_type` (string): "Power Module"
- `module_type` (string): "Li-Ion Battery Charger"
- `input_voltage` (string): "5V USB"
- `output_voltage` (string): "4.2V"
- `output_current` (string): "1A max"
- `efficiency` (string): "> 90%"
- `protection` (string): "Overcurrent, Overvoltage, Reverse Polarity"
- `battery_type` (string): "Li-Ion / Li-Po"

**Filter Fields**:
- `product_type` (enum): "power"
- `module_type` (enum): "battery", "charger", "regulator", "converter", "solar-panel"
- `input_voltage_min_v` (number): 4.5
- `input_voltage_max_v` (number): 12.0
- `output_voltage_v` (number): 3.3, 4.2, 5.0, 12.0
- `output_current_a` (number): 0.5, 1.0, 2.0, 3.0
- `efficiency_percent` (number): 85, 90, 95
- `protection_features` (array): ["overcurrent", "overvoltage", "reverse-polarity", "short-circuit", "thermal"]
- `battery_type` (enum): "li-ion", "li-po", "nimh", "nicd", "alkaline"
- `battery_capacity_mah` (number): 500, 1000, 2000, 5000, 10000

**Example**:
```json
{
  "display": {
    "product_type": "Power Module",
    "module_type": "Li-Ion Battery Charger",
    "input_voltage": "5V USB (4.5V - 5.5V)",
    "output_voltage": "4.2V (Li-Ion standard)",
    "output_current": "1A maximum",
    "efficiency": "> 90%",
    "protection": "Overcurrent, Overvoltage, Reverse Polarity, Thermal Shutdown",
    "battery_type": "Li-Ion / Li-Po (single cell)"
  },
  "filters": {
    "product_type": "power",
    "module_type": "charger",
    "input_voltage_min_v": 4.5,
    "input_voltage_max_v": 5.5,
    "output_voltage_v": 4.2,
    "output_current_a": 1.0,
    "efficiency_percent": 90,
    "protection_features": ["overcurrent", "overvoltage", "reverse-polarity", "thermal"],
    "battery_type": "li-ion"
  }
}
```

---

### 5. Communication Module (`communication`)

**Display Fields**:
- `product_type` (string): "Communication Module"
- `protocol` (string): "LoRa"
- `frequency` (string): "915 MHz"
- `range` (string): "Up to 5 km (line of sight)"
- `data_rate` (string): "300 kbps maximum"
- `interfaces` (string): "SPI"
- `antenna` (string): "U.FL connector (external antenna)"
- `operating_voltage` (string): "3.3V"

**Filter Fields**:
- `product_type` (enum): "communication"
- `protocol` (enum): "wifi", "bluetooth", "lora", "zigbee", "thread", "cellular", "nfc", "rfid"
- `frequency_mhz` (number): 433, 868, 915, 2400, 5000
- `range_meters` (number): 10, 50, 100, 1000, 5000
- `data_rate_kbps` (number): 1, 10, 100, 300, 1000, 150000
- `interfaces` (array): ["spi", "uart", "i2c", "usb"]
- `antenna_type` (enum): "internal", "external", "ufl-connector", "sma-connector", "pcb-trace"
- `operating_voltage_v` (number): 3.3, 5.0

**Example**:
```json
{
  "display": {
    "product_type": "Communication Module",
    "protocol": "LoRa (Long Range)",
    "frequency": "915 MHz (US)",
    "range": "Up to 5 km (line of sight)",
    "data_rate": "300 kbps maximum",
    "interfaces": "SPI",
    "antenna": "U.FL connector (external antenna required)",
    "operating_voltage": "3.3V"
  },
  "filters": {
    "product_type": "communication",
    "protocol": "lora",
    "frequency_mhz": 915,
    "range_meters": 5000,
    "data_rate_kbps": 300,
    "interfaces": ["spi"],
    "antenna_type": "ufl-connector",
    "operating_voltage_v": 3.3
  }
}
```

---

### 6. Accessory (`accessory`)

**Display Fields**:
- `product_type` (string): "Accessory"
- `accessory_type` (string): "USB Cable"
- `length` (string): "1 meter"
- `connector_type` (string): "USB-C to USB-A"
- `material` (string): "Braided Nylon"
- `quantity` (string): "1 cable"
- `compatible_with` (string): "ESP32-S3, ESP32-C6"

**Filter Fields**:
- `product_type` (enum): "accessory"
- `accessory_type` (enum): "cable", "adapter", "case", "antenna", "breadboard", "jumper-wires", "tools", "kit"
- `length_cm` (number): 10, 30, 50, 100, 200
- `connector_types` (array): ["usb-c", "usb-a", "micro-usb", "male-male", "female-female", "male-female"]
- `quantity` (number): 1, 10, 20, 40, 100
- `compatible_with` (array): ["ESP32", "ESP32-S2", "ESP32-S3", "ESP32-C3", "ESP32-C6", "ESP32-H2"]

**Example**:
```json
{
  "display": {
    "product_type": "Accessory",
    "accessory_type": "USB Cable",
    "length": "1 meter (3.3 feet)",
    "connector_type": "USB-C to USB-A",
    "material": "Braided Nylon (durable)",
    "quantity": "1 cable",
    "compatible_with": "ESP32-S3, ESP32-C6, and other USB-C devices"
  },
  "filters": {
    "product_type": "accessory",
    "accessory_type": "cable",
    "length_cm": 100,
    "connector_types": ["usb-c", "usb-a"],
    "quantity": 1,
    "compatible_with": ["ESP32-S3", "ESP32-C6"]
  }
}
```

---

## Database Schema Changes

### JSONB Column with Dual Structure (Recommended)

**Pros**:
- ✅ Flexible schema per product type
- ✅ Efficient range queries with numeric filter fields
- ✅ Fast array containment searches
- ✅ Type-safe boolean filtering
- ✅ No string parsing overhead
- ✅ GIN indexes for complex queries
- ✅ Expression indexes for high-traffic filters
- ✅ No schema migrations needed for new metadata fields

**Cons**:
- Requires application-level validation (solved with JSON Schema)
- Slightly more storage (display + filters, ~2x), but acceptable for metadata size

```sql
-- Add metadata column with dual structure
ALTER TABLE products 
ADD COLUMN metadata JSONB DEFAULT '{"display": {}, "filters": {}}'::JSONB;

-- Create GIN index for full metadata search
CREATE INDEX idx_products_metadata_gin 
ON products USING GIN (metadata);

-- Create specialized GIN index for filter fields (most common queries)
CREATE INDEX idx_products_metadata_filters_gin 
ON products USING GIN ((metadata->'filters'));

-- Create expression indexes for high-traffic filter fields
CREATE INDEX idx_products_product_type 
ON products ((metadata->'filters'->>'product_type'));

CREATE INDEX idx_products_chip 
ON products ((metadata->'filters'->>'chip'));

CREATE INDEX idx_products_chip_series 
ON products ((metadata->'filters'->>'chip_series'));

-- Create indexes for numeric range queries
CREATE INDEX idx_products_psram_mb 
ON products (((metadata->'filters'->>'psram_mb')::integer))
WHERE (metadata->'filters'->>'psram_mb') IS NOT NULL;

CREATE INDEX idx_products_flash_mb 
ON products (((metadata->'filters'->>'flash_mb')::integer))
WHERE (metadata->'filters'->>'flash_mb') IS NOT NULL;

CREATE INDEX idx_products_gpio_pins 
ON products (((metadata->'filters'->>'gpio_pins')::integer))
WHERE (metadata->'filters'->>'gpio_pins') IS NOT NULL;

-- Create indexes for common sensor filters
CREATE INDEX idx_products_sensor_types 
ON products USING GIN ((metadata->'filters'->'sensor_types'))
WHERE metadata->'filters'->>'product_type' = 'sensor';
```

---

## Efficient Filter Queries

### ✅ Simple Equality Filters

```sql
-- Find all ESP32-S3 boards
SELECT id, title, current_price, metadata->'display' as display_metadata
FROM products
WHERE metadata->'filters'->>'chip' = 'ESP32-S3';

-- Find all sensors
SELECT id, title, metadata->'display' as display_metadata
FROM products
WHERE metadata->'filters'->>'product_type' = 'sensor';

-- Find all USB-C boards
SELECT id, title, metadata->'display' as display_metadata
FROM products
WHERE metadata->'filters'->>'usb_type' = 'usb-c';
```

### ✅ Numeric Range Queries (Fast!)

```sql
-- Find boards with PSRAM >= 8MB
SELECT id, title, metadata->'display'->'psram' as psram_display
FROM products
WHERE (metadata->'filters'->>'psram_mb')::integer >= 8;

-- Find boards with 32-50 GPIO pins
SELECT id, title, metadata->'display'->'gpio' as gpio_display
FROM products
WHERE (metadata->'filters'->>'gpio_pins')::integer BETWEEN 32 AND 50;

-- Find displays 2-4 inches
SELECT id, title, metadata->'display'->'screen_size' as screen_size_display
FROM products
WHERE (metadata->'filters'->>'screen_size_inches')::numeric BETWEEN 2 AND 4;

-- Find sensors with temperature range including sub-zero
SELECT id, title, metadata->'display'->'temperature_range' as temp_range
FROM products
WHERE (metadata->'filters'->>'temperature_range_min_c')::integer < 0;
```

### ✅ Array Containment (Sensors, WiFi Standards, Interfaces)

```sql
-- Find sensors with temperature capability
SELECT id, title, metadata->'display'->'sensors' as sensors_display
FROM products
WHERE metadata->'filters'->'sensor_types' ? 'temperature';

-- Find boards supporting WiFi 6 (802.11ax)
SELECT id, title, metadata->'display'->'wifi' as wifi_display
FROM products
WHERE metadata->'filters'->'wifi_standards' ? '802.11ax';

-- Find sensors with BOTH temperature AND humidity
SELECT id, title
FROM products
WHERE metadata->'filters'->'sensor_types' ?& array['temperature', 'humidity'];

-- Find sensors with temperature OR humidity OR pressure
SELECT id, title
FROM products
WHERE metadata->'filters'->'sensor_types' ?| array['temperature', 'humidity', 'pressure'];

-- Find displays with SPI interface
SELECT id, title
FROM products
WHERE metadata->'filters'->'interfaces' ? 'spi';
```

### ✅ Boolean Filters

```sql
-- Find boards with camera connector
SELECT id, title, metadata->'display'->'camera_connector' as camera_display
FROM products
WHERE (metadata->'filters'->>'has_camera_connector')::boolean = true;

-- Find boards WITHOUT Zigbee
SELECT id, title
FROM products
WHERE (metadata->'filters'->>'has_zigbee')::boolean = false;

-- Find color displays
SELECT id, title
FROM products
WHERE (metadata->'filters'->>'is_color')::boolean = true;

-- Find displays with touchscreen
SELECT id, title
FROM products
WHERE (metadata->'filters'->>'has_touchscreen')::boolean = true;
```

### ✅ Combined Filters (Real-World Use Cases)

```sql
-- Find ESP32-S3 boards with ≥8MB PSRAM, USB-C, and camera connector
-- Sorted by price
SELECT 
  id, 
  title, 
  current_price,
  metadata->'display' as display_metadata
FROM products
WHERE metadata->'filters'->>'product_type' = 'development_board'
  AND metadata->'filters'->>'chip' = 'ESP32-S3'
  AND (metadata->'filters'->>'psram_mb')::integer >= 8
  AND metadata->'filters'->>'usb_type' = 'usb-c'
  AND (metadata->'filters'->>'has_camera_connector')::boolean = true
ORDER BY current_price ASC;

-- Find temperature sensors with I2C interface and <1s response time
SELECT 
  id, 
  title,
  current_price,
  metadata->'display' as display_metadata
FROM products
WHERE metadata->'filters'->>'product_type' = 'sensor'
  AND metadata->'filters'->'sensor_types' ? 'temperature'
  AND metadata->'filters'->'interfaces' ? 'i2c'
  AND (metadata->'filters'->>'response_time_ms')::integer <= 1000
ORDER BY current_price ASC;

-- Find all ESP32-S series boards (S2, S3) with WiFi 4+
SELECT 
  id,
  title,
  metadata->'filters'->>'chip' as chip,
  metadata->'display'->'wifi' as wifi_display
FROM products
WHERE metadata->'filters'->>'product_type' = 'development_board'
  AND metadata->'filters'->>'chip_series' = 'ESP32-S'
  AND (metadata->'filters'->>'wifi_generation')::integer >= 4
ORDER BY current_price ASC;

-- Find 3+ inch color touchscreen displays
SELECT 
  id,
  title,
  metadata->'display' as display_metadata
FROM products
WHERE metadata->'filters'->>'product_type' = 'display'
  AND (metadata->'filters'->>'screen_size_inches')::numeric >= 3
  AND (metadata->'filters'->>'is_color')::boolean = true
  AND (metadata->'filters'->>'has_touchscreen')::boolean = true
ORDER BY (metadata->'filters'->>'screen_size_inches')::numeric ASC;
```

### ✅ Faceted Search / Filter Counts

```sql
-- Count products by chip type (for filter UI)
SELECT 
  metadata->'filters'->>'chip' as chip,
  COUNT(*) as product_count
FROM products
WHERE metadata->'filters'->>'product_type' = 'development_board'
GROUP BY metadata->'filters'->>'chip'
ORDER BY product_count DESC;

-- Count products by PSRAM size (for filter UI)
SELECT 
  metadata->'filters'->>'psram_mb' as psram_mb,
  COUNT(*) as product_count
FROM products
WHERE metadata->'filters'->>'product_type' = 'development_board'
  AND (metadata->'filters'->>'psram_mb')::integer > 0
GROUP BY metadata->'filters'->>'psram_mb'
ORDER BY (metadata->'filters'->>'psram_mb')::integer ASC;

-- Count products by sensor type (for filter UI)
SELECT 
  sensor_type,
  COUNT(DISTINCT id) as product_count
FROM products,
  jsonb_array_elements_text(metadata->'filters'->'sensor_types') as sensor_type
WHERE metadata->'filters'->>'product_type' = 'sensor'
GROUP BY sensor_type
ORDER BY product_count DESC;
```

---

## API Endpoints

### 1. Update Product Metadata

**Endpoint**: `POST /products/:product_id/metadata`

**Request Body**:
```json
{
  "metadata": {
    "display": {
      "product_type": "Development Board",
      "chip": "ESP32-S3",
      "psram": "8MB PSRAM",
      "flash": "16MB Flash",
      "wifi": "802.11 b/g/n (WiFi 4)",
      "bluetooth": "BLE 5.0",
      "zigbee": "No",
      "battery_connector": "Yes",
      "camera_connector": "Yes (OV2640 compatible)"
    },
    "filters": {
      "product_type": "development_board",
      "chip": "ESP32-S3",
      "chip_series": "ESP32-S",
      "psram_mb": 8,
      "flash_mb": 16,
      "wifi_standards": ["802.11b", "802.11g", "802.11n"],
      "wifi_generation": 4,
      "bluetooth_version": 5.0,
      "has_ble": true,
      "has_zigbee": false,
      "has_battery_connector": true,
      "has_camera_connector": true
    }
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "product_id": "uuid-here",
  "metadata": {
    "display": { ...display fields... },
    "filters": { ...filter fields... }
  },
  "updated_at": "2025-11-24T18:00:00Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid metadata",
  "details": {
    "filters.chip": "Must be one of: ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, ESP32-H2",
    "filters.psram_mb": "Must be a positive integer"
  }
}
```

---

### 2. Get Product with Metadata

**Endpoint**: `GET /products/:product_id`

**Response** (200 OK):
```json
{
  "id": "uuid-here",
  "asin": "B08DQQ8CBP",
  "title": "ESP32-S3 DevKit with 8MB PSRAM",
  "current_price": 19.99,
  "metadata": {
    "display": {
      "product_type": "Development Board",
      "chip": "ESP32-S3",
      "psram": "8MB PSRAM",
      "flash": "16MB Flash"
    },
    "filters": {
      "product_type": "development_board",
      "chip": "ESP32-S3",
      "psram_mb": 8,
      "flash_mb": 16
    }
  },
  "created_at": "2025-11-24T16:00:00Z",
  "updated_at": "2025-11-24T18:00:00Z"
}
```

---

### 3. Filter Products by Metadata

**Endpoint**: `GET /products?filter[chip]=ESP32-S3&filter[psram_mb_gte]=8`

**Query Parameters**:
- `filter[chip]=ESP32-S3` → `WHERE metadata->'filters'->>'chip' = 'ESP32-S3'`
- `filter[psram_mb_gte]=8` → `WHERE (metadata->'filters'->>'psram_mb')::integer >= 8`
- `filter[sensor_types]=temperature` → `WHERE metadata->'filters'->'sensor_types' ? 'temperature'`
- `filter[has_camera_connector]=true` → `WHERE (metadata->'filters'->>'has_camera_connector')::boolean = true`

**Comparison Operators**:
- `_eq` (default): Equal to
- `_gte`: Greater than or equal to
- `_lte`: Less than or equal to
- `_gt`: Greater than
- `_lt`: Less than
- `_contains`: Array contains value (for sensor_types, interfaces, etc.)

**Response** (200 OK):
```json
{
  "products": [
    {
      "id": "uuid-1",
      "asin": "B08DQQ8CBP",
      "title": "ESP32-S3 DevKit with 8MB PSRAM",
      "current_price": 19.99,
      "metadata": {
        "display": { ...display fields... },
        "filters": { ...filter fields... }
      }
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20,
  "filters_applied": {
    "chip": "ESP32-S3",
    "psram_mb_gte": 8
  }
}
```

**Advanced Filtering Examples**:
```
# Find ESP32-S3 boards with ≥8MB PSRAM and USB-C
GET /products?filter[chip]=ESP32-S3&filter[psram_mb_gte]=8&filter[usb_type]=usb-c

# Find temperature sensors with I2C interface
GET /products?filter[product_type]=sensor&filter[sensor_types_contains]=temperature&filter[interfaces_contains]=i2c

# Find color touchscreen displays ≥3 inches
GET /products?filter[product_type]=display&filter[screen_size_inches_gte]=3&filter[is_color]=true&filter[has_touchscreen]=true

# Find boards with WiFi 6 support
GET /products?filter[wifi_generation_gte]=6
```

---

## Validation Schema

Use JSON Schema to validate metadata structure (both display and filter fields):

```typescript
// supabase/functions/_shared/metadata-schemas.ts

export const metadataSchemas = {
  development_board: {
    type: "object",
    required: ["display", "filters"],
    properties: {
      display: {
        type: "object",
        required: ["product_type", "chip"],
        properties: {
          product_type: { type: "string" },
          chip: { type: "string" },
          psram: { type: "string" },
          flash: { type: "string" },
          wifi: { type: "string" },
          bluetooth: { type: "string" },
          zigbee: { type: "string" },
          // ... other display fields
        }
      },
      filters: {
        type: "object",
        required: ["product_type", "chip"],
        properties: {
          product_type: { const: "development_board" },
          chip: { 
            enum: ["ESP32", "ESP32-S2", "ESP32-S3", "ESP32-C3", "ESP32-C6", "ESP32-H2"] 
          },
          chip_series: {
            enum: ["ESP32", "ESP32-S", "ESP32-C", "ESP32-H"]
          },
          psram_mb: { type: "number", minimum: 0 },
          flash_mb: { type: "number", minimum: 0 },
          wifi_standards: {
            type: "array",
            items: { enum: ["802.11b", "802.11g", "802.11n", "802.11ac", "802.11ax"] }
          },
          wifi_generation: { type: "number", minimum: 4, maximum: 6 },
          bluetooth_version: { type: "number" },
          has_ble: { type: "boolean" },
          has_zigbee: { type: "boolean" },
          has_thread: { type: "boolean" },
          has_battery_connector: { type: "boolean" },
          has_camera_connector: { type: "boolean" },
          has_lcd_connector: { type: "boolean" },
          usb_type: { enum: ["micro-usb", "usb-c", "usb-a", "none"] },
          gpio_pins: { type: "number", minimum: 0, maximum: 100 },
          form_factor: { enum: ["devkit", "mini", "pico", "wrover", "wroom"] },
          operating_voltage_v: { type: "number" }
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  },
  
  sensor: {
    type: "object",
    required: ["display", "filters"],
    properties: {
      display: {
        type: "object",
        required: ["product_type", "sensors"],
        properties: {
          product_type: { type: "string" },
          sensors: { type: "string" },
          temperature_range: { type: "string" },
          humidity_range: { type: "string" },
          // ... other display fields
        }
      },
      filters: {
        type: "object",
        required: ["product_type", "sensor_types"],
        properties: {
          product_type: { const: "sensor" },
          sensor_types: {
            type: "array",
            items: {
              enum: [
                "temperature", "humidity", "pressure", "gas", "light", 
                "motion", "proximity", "accelerometer", "gyroscope", 
                "magnetometer", "sound", "distance", "color", "uv", 
                "co2", "particulate"
              ]
            },
            minItems: 1
          },
          temperature_range_min_c: { type: "number" },
          temperature_range_max_c: { type: "number" },
          humidity_range_min_pct: { type: "number", minimum: 0, maximum: 100 },
          humidity_range_max_pct: { type: "number", minimum: 0, maximum: 100 },
          pressure_range_min_hpa: { type: "number" },
          pressure_range_max_hpa: { type: "number" },
          interfaces: {
            type: "array",
            items: { enum: ["i2c", "spi", "uart", "analog", "digital"] }
          },
          operating_voltage_v: { type: "number" },
          voltage_range_min_v: { type: "number" },
          voltage_range_max_v: { type: "number" },
          accuracy_percent: { type: "number" },
          accuracy_degrees_c: { type: "number" },
          response_time_ms: { type: "number", minimum: 0 }
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  }
  
  // ... schemas for display, power, communication, accessory
};

export function validateMetadata(metadata: unknown): ValidationResult {
  // Validate structure has both display and filters
  if (!metadata || typeof metadata !== 'object') {
    return {
      valid: false,
      errors: ['Metadata must be an object with "display" and "filters" properties']
    };
  }
  
  const metadataObj = metadata as any;
  
  if (!metadataObj.filters || !metadataObj.display) {
    return {
      valid: false,
      errors: ['Metadata must have both "display" and "filters" properties']
    };
  }
  
  const productType = metadataObj.filters?.product_type;
  
  if (!productType || !(productType in metadataSchemas)) {
    return {
      valid: false,
      errors: [`Invalid or missing filters.product_type. Must be one of: ${Object.keys(metadataSchemas).join(", ")}`]
    };
  }
  
  const schema = metadataSchemas[productType];
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(metadata);
  
  return {
    valid,
    errors: valid ? [] : validate.errors?.map(e => `${e.instancePath} ${e.message}`) || []
  };
}
```

---

## Implementation Tasks

See [`specs/001-esp32-store/tasks.md`](specs/001-esp32-store/tasks.md) for detailed task breakdown (T110-T125).

**Phase 9: Product Metadata System**
- T110: Database schema migration (add metadata JSONB column)
- T111: Create metadata validation schemas
- T112: Create update-metadata Edge Function
- T113: Add metadata filtering to products query
- T114-T119: Implement metadata schemas for each product type
- T120-T125: Testing and validation

---

## UI Considerations (Future)

1. **Metadata Entry Form**: Type-specific form fields based on `product_type`
2. **Autocomplete**: Suggest common values (e.g., chip models, interfaces)
3. **Bulk Edit**: Update metadata for multiple products at once
4. **Import/Export**: CSV import for bulk metadata entry
5. **Validation Feedback**: Real-time validation as admin types
6. **Filter UI**: Faceted search with checkboxes and sliders

---

## Open Questions

1. **Q**: Should metadata be versioned (audit history)?
   **A**: Yes, add `metadata_history` JSONB array to track changes

2. **Q**: How to handle product type changes?
   **A**: Require clearing existing metadata or migration path

3. **Q**: Should certain metadata fields be searchable/indexed?
   **A**: Yes, create indexes for most-used filter fields (chip, sensor_types, etc.)

4. **Q**: How to handle units (MB vs GB, inches vs cm)?
   **A**: Store as strings with units, convert in application layer for comparisons

5. **Q**: Should we support custom metadata fields?
   **A**: Phase 2 feature - admin-defined custom fields per product

---

## Related Documentation

- [Database Schema](../plan.md#database-schema)
- [API Specifications](../spec.md#api-endpoints)
- [Tasks](../tasks.md) - T110-T125

---

**Status**: ✅ Specification Complete - Ready for Implementation  
**Next Step**: T110 - Create database migration for metadata column
