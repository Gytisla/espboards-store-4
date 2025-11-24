/**
 * Product Metadata Validation Schemas
 * 
 * Purpose: Validate product metadata using JSON Schema (Ajv)
 * User Story: US4 - Product Metadata Management
 * Task: T111
 * 
 * Architecture:
 * - Dual-structure metadata: display (UI) + filters (queries)
 * - 6 product types with type-specific schemas
 * - Strict validation with no additional properties
 * - Type-safe enums and ranges
 * 
 * Usage:
 * ```typescript
 * const result = validateMetadata(metadata);
 * if (!result.valid) {
 *   throw createError({ statusCode: 400, message: result.errors.join(", ") });
 * }
 * ```
 */

import Ajv, { type JSONSchemaType } from "ajv";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Product type enum - defines the 6 supported product categories
 */
export type ProductType =
  | "development_board"
  | "sensor"
  | "display"
  | "power"
  | "communication"
  | "accessory";

/**
 * Validation result returned by validateMetadata()
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Base metadata structure with dual display/filters design
 */
export interface ProductMetadata {
  display: Record<string, any>;
  filters: {
    product_type: ProductType;
    [key: string]: any;
  };
}

// ============================================================================
// JSON SCHEMAS
// ============================================================================

/**
 * Schema for Development Board metadata
 * Required: product_type, chip
 * Optional: psram, flash, wifi, bluetooth, etc.
 */
const developmentBoardSchema = {
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
        thread: { type: "string" },
        battery_connector: { type: "string" },
        camera_connector: { type: "string" },
        lcd_connector: { type: "string" },
        usb: { type: "string" },
        gpio: { type: "string" },
        form_factor: { type: "string" },
        operating_voltage: { type: "string" },
      },
      additionalProperties: false,
    },
    filters: {
      type: "object",
      required: ["product_type", "chip"],
      properties: {
        product_type: { type: "string", const: "development_board" },
        chip: {
          type: "string",
          enum: ["ESP32", "ESP32-S2", "ESP32-S3", "ESP32-C3", "ESP32-C6", "ESP32-H2"],
        },
        chip_series: {
          type: "string",
          enum: ["ESP32", "ESP32-S", "ESP32-C", "ESP32-H"],
        },
        psram_mb: { type: "number", minimum: 0 },
        flash_mb: { type: "number", minimum: 0 },
        wifi_standards: {
          type: "array",
          items: {
            type: "string",
            enum: ["802.11b", "802.11g", "802.11n", "802.11ac", "802.11ax"],
          },
        },
        wifi_generation: { type: "number", minimum: 4, maximum: 6 },
        bluetooth_version: { type: "number" },
        has_ble: { type: "boolean" },
        has_zigbee: { type: "boolean" },
        has_thread: { type: "boolean" },
        has_battery_connector: { type: "boolean" },
        has_camera_connector: { type: "boolean" },
        has_lcd_connector: { type: "boolean" },
        usb_type: {
          type: "string",
          enum: ["micro-usb", "usb-c", "usb-a", "none"],
        },
        gpio_pins: { type: "number", minimum: 0, maximum: 100 },
        form_factor: {
          type: "string",
          enum: ["devkit", "mini", "pico", "wrover", "wroom"],
        },
        operating_voltage_v: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/**
 * Schema for Sensor Module metadata
 * Required: product_type, sensor_types (array, min 1 item)
 * Optional: temperature/humidity/pressure ranges, interfaces, etc.
 */
const sensorSchema = {
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
        pressure_range: { type: "string" },
        interfaces: { type: "string" },
        operating_voltage: { type: "string" },
        accuracy: { type: "string" },
        response_time: { type: "string" },
      },
      additionalProperties: false,
    },
    filters: {
      type: "object",
      required: ["product_type", "sensor_types"],
      properties: {
        product_type: { type: "string", const: "sensor" },
        sensor_types: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "temperature",
              "humidity",
              "pressure",
              "gas",
              "light",
              "motion",
              "proximity",
              "accelerometer",
              "gyroscope",
              "magnetometer",
              "sound",
              "distance",
              "color",
              "uv",
              "co2",
              "particulate",
            ],
          },
          minItems: 1,
        },
        temperature_range_min_c: { type: "number" },
        temperature_range_max_c: { type: "number" },
        humidity_range_min_pct: { type: "number", minimum: 0, maximum: 100 },
        humidity_range_max_pct: { type: "number", minimum: 0, maximum: 100 },
        pressure_range_min_hpa: { type: "number" },
        pressure_range_max_hpa: { type: "number" },
        interfaces: {
          type: "array",
          items: {
            type: "string",
            enum: ["i2c", "spi", "uart", "analog", "digital"],
          },
        },
        operating_voltage_v: { type: "number" },
        voltage_range_min_v: { type: "number" },
        voltage_range_max_v: { type: "number" },
        accuracy_percent: { type: "number" },
        accuracy_degrees_c: { type: "number" },
        response_time_ms: { type: "number", minimum: 0 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/**
 * Schema for Display Module metadata
 * Required: product_type, display_type
 * Optional: screen_size, resolution, color_depth, touchscreen, etc.
 */
const displaySchema = {
  type: "object",
  required: ["display", "filters"],
  properties: {
    display: {
      type: "object",
      required: ["product_type", "display_type"],
      properties: {
        product_type: { type: "string" },
        display_type: { type: "string" },
        screen_size: { type: "string" },
        resolution: { type: "string" },
        color_depth: { type: "string" },
        interfaces: { type: "string" },
        touchscreen: { type: "string" },
        backlight: { type: "string" },
        operating_voltage: { type: "string" },
      },
      additionalProperties: false,
    },
    filters: {
      type: "object",
      required: ["product_type", "display_type"],
      properties: {
        product_type: { type: "string", const: "display" },
        display_type: {
          type: "string",
          enum: ["lcd", "oled", "e-ink", "tft", "led-matrix"],
        },
        screen_size_inches: { type: "number", minimum: 0 },
        resolution_width: { type: "number", minimum: 0 },
        resolution_height: { type: "number", minimum: 0 },
        resolution_total_pixels: { type: "number", minimum: 0 },
        color_depth_bits: { type: "number", enum: [1, 16, 18, 24] },
        is_color: { type: "boolean" },
        interfaces: {
          type: "array",
          items: {
            type: "string",
            enum: ["spi", "i2c", "parallel", "hdmi"],
          },
        },
        has_touchscreen: { type: "boolean" },
        touchscreen_type: {
          type: "string",
          enum: ["resistive", "capacitive", "none"],
        },
        has_backlight: { type: "boolean" },
        operating_voltage_v: { type: "number" },
        voltage_range_min_v: { type: "number" },
        voltage_range_max_v: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/**
 * Schema for Power Module metadata
 * Required: product_type, module_type
 * Optional: voltages, current, efficiency, protection, battery_type, etc.
 */
const powerSchema = {
  type: "object",
  required: ["display", "filters"],
  properties: {
    display: {
      type: "object",
      required: ["product_type", "module_type"],
      properties: {
        product_type: { type: "string" },
        module_type: { type: "string" },
        input_voltage: { type: "string" },
        output_voltage: { type: "string" },
        output_current: { type: "string" },
        efficiency: { type: "string" },
        protection: { type: "string" },
        battery_type: { type: "string" },
        capacity: { type: "string" },
      },
      additionalProperties: false,
    },
    filters: {
      type: "object",
      required: ["product_type", "module_type"],
      properties: {
        product_type: { type: "string", const: "power" },
        module_type: {
          type: "string",
          enum: ["battery", "charger", "regulator", "converter", "solar-panel"],
        },
        input_voltage_min_v: { type: "number" },
        input_voltage_max_v: { type: "number" },
        output_voltage_v: { type: "number" },
        output_current_a: { type: "number" },
        efficiency_percent: { type: "number", minimum: 0, maximum: 100 },
        protection_features: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "overcurrent",
              "overvoltage",
              "reverse-polarity",
              "short-circuit",
              "thermal",
            ],
          },
        },
        battery_type: {
          type: "string",
          enum: ["li-ion", "li-po", "nimh", "nicd", "alkaline"],
        },
        battery_capacity_mah: { type: "number", minimum: 0 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/**
 * Schema for Communication Module metadata
 * Required: product_type, protocol
 * Optional: frequency, range, data_rate, interfaces, antenna, etc.
 */
const communicationSchema = {
  type: "object",
  required: ["display", "filters"],
  properties: {
    display: {
      type: "object",
      required: ["product_type", "protocol"],
      properties: {
        product_type: { type: "string" },
        protocol: { type: "string" },
        frequency: { type: "string" },
        range: { type: "string" },
        data_rate: { type: "string" },
        interfaces: { type: "string" },
        antenna: { type: "string" },
        operating_voltage: { type: "string" },
      },
      additionalProperties: false,
    },
    filters: {
      type: "object",
      required: ["product_type", "protocol"],
      properties: {
        product_type: { type: "string", const: "communication" },
        protocol: {
          type: "string",
          enum: [
            "wifi",
            "bluetooth",
            "lora",
            "zigbee",
            "thread",
            "cellular",
            "nfc",
            "rfid",
          ],
        },
        frequency_mhz: { type: "number" },
        range_meters: { type: "number", minimum: 0 },
        data_rate_kbps: { type: "number", minimum: 0 },
        interfaces: {
          type: "array",
          items: {
            type: "string",
            enum: ["spi", "uart", "i2c", "usb"],
          },
        },
        antenna_type: {
          type: "string",
          enum: [
            "internal",
            "external",
            "ufl-connector",
            "sma-connector",
            "pcb-trace",
          ],
        },
        operating_voltage_v: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/**
 * Schema for Accessory metadata
 * Required: product_type, accessory_type
 * Optional: length, connector_type, material, quantity, compatible_with
 */
const accessorySchema = {
  type: "object",
  required: ["display", "filters"],
  properties: {
    display: {
      type: "object",
      required: ["product_type", "accessory_type"],
      properties: {
        product_type: { type: "string" },
        accessory_type: { type: "string" },
        length: { type: "string" },
        connector_type: { type: "string" },
        material: { type: "string" },
        quantity: { type: "string" },
        compatible_with: { type: "string" },
      },
      additionalProperties: false,
    },
    filters: {
      type: "object",
      required: ["product_type", "accessory_type"],
      properties: {
        product_type: { type: "string", const: "accessory" },
        accessory_type: {
          type: "string",
          enum: [
            "cable",
            "adapter",
            "case",
            "antenna",
            "breadboard",
            "jumper-wires",
            "tools",
            "kit",
          ],
        },
        length_cm: { type: "number", minimum: 0 },
        connector_types: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "usb-c",
              "usb-a",
              "micro-usb",
              "male-male",
              "female-female",
              "male-female",
            ],
          },
        },
        quantity: { type: "number", minimum: 1 },
        compatible_with: {
          type: "array",
          items: {
            type: "string",
            enum: ["ESP32", "ESP32-S2", "ESP32-S3", "ESP32-C3", "ESP32-C6", "ESP32-H2"],
          },
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

// ============================================================================
// SCHEMA REGISTRY
// ============================================================================

/**
 * Registry of all metadata schemas by product type
 * Used by validateMetadata() to select the appropriate schema
 */
export const metadataSchemas: Record<ProductType, any> = {
  development_board: developmentBoardSchema,
  sensor: sensorSchema,
  display: displaySchema,
  power: powerSchema,
  communication: communicationSchema,
  accessory: accessorySchema,
};

// ============================================================================
// VALIDATION FUNCTION
// ============================================================================

/**
 * Validate product metadata against product-type-specific JSON Schema
 * 
 * Process:
 * 1. Check metadata is an object with display and filters properties
 * 2. Extract product_type from filters
 * 3. Validate product_type is one of 6 supported types
 * 4. Validate metadata against product-type-specific schema using Ajv
 * 
 * @param metadata - Metadata object to validate
 * @returns ValidationResult with valid flag and error messages
 * 
 * @example
 * ```typescript
 * const result = validateMetadata({
 *   display: { product_type: "Development Board", chip: "ESP32-S3" },
 *   filters: { product_type: "development_board", chip: "ESP32-S3" }
 * });
 * 
 * if (!result.valid) {
 *   console.error("Validation errors:", result.errors);
 * }
 * ```
 */
export function validateMetadata(metadata: unknown): ValidationResult {
  // Step 1: Check metadata is an object
  if (!metadata || typeof metadata !== "object") {
    return {
      valid: false,
      errors: ['Metadata must be an object with "display" and "filters" properties'],
    };
  }

  const metadataObj = metadata as any;

  // Step 2: Check for required display and filters properties
  if (!metadataObj.filters || !metadataObj.display) {
    return {
      valid: false,
      errors: ['Metadata must have both "display" and "filters" properties'],
    };
  }

  // Step 3: Extract and validate product_type
  const productType = metadataObj.filters?.product_type;

  if (!productType || !(productType in metadataSchemas)) {
    return {
      valid: false,
      errors: [
        `Invalid or missing filters.product_type. Must be one of: ${Object.keys(metadataSchemas).join(", ")}`,
      ],
    };
  }

  // Step 4: Validate against product-type-specific schema
  const schema = metadataSchemas[productType as ProductType];
  // Configure Ajv with strict validation
  // - allErrors: collect all errors, not just the first one
  // - strict: false - allow JSON Schema draft-07 features
  // - strictSchema: false - don't validate schema itself strictly
  const ajv = new Ajv({ 
    allErrors: true, 
    strict: false, 
    strictSchema: false,
    // Don't remove additional properties, just report errors
    removeAdditional: false
  });
  const validate = ajv.compile(schema);
  const valid = validate(metadata);

  return {
    valid,
    errors: valid
      ? []
      : (validate.errors?.map(
          (e) => `${e.instancePath} ${e.message}${e.params ? `: ${JSON.stringify(e.params)}` : ""}`
        ) || []),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get list of all supported product types
 */
export function getSupportedProductTypes(): ProductType[] {
  return Object.keys(metadataSchemas) as ProductType[];
}

/**
 * Check if a product type is supported
 */
export function isValidProductType(type: string): type is ProductType {
  return type in metadataSchemas;
}

/**
 * Get schema for a specific product type
 */
export function getSchemaForProductType(type: ProductType): any {
  return metadataSchemas[type];
}
