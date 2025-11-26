# ESP32 Board Categorization Guide

This document provides detailed specifications for categorizing ESP32 board variants based on their chip type, wireless capabilities, and technical features.

## Overview

ESP32 is a series of low-cost, low-power system-on-chip microcontrollers with integrated Wi-Fi and Bluetooth capabilities. Espressif Systems produces multiple variants, each with different feature sets optimized for specific use cases.

---

## ESP32 (Classic/Original)

**Official Name:** ESP32 (ESP32-D0WD, ESP32-D0WDQ6, ESP32-U4WDH)

### Wireless Connectivity
- **Wi-Fi:** ✅ Yes (802.11 b/g/n, 2.4 GHz)
- **Bluetooth:** ✅ Yes (Bluetooth 4.2 BR/EDR and BLE)
- **Thread:** ❌ No
- **Zigbee:** ❌ No

### Key Specifications
- **CPU:** Dual-core Xtensa LX6, up to 240 MHz
- **RAM:** 520 KB SRAM
- **Flash:** External (typically 4 MB)
- **GPIO:** Up to 34 programmable GPIOs
- **ADC:** 18 channels, 12-bit SAR ADC
- **DAC:** 2 channels, 8-bit DAC
- **Interfaces:** SPI, I2C, I2S, UART, CAN, Ethernet MAC, SD/SDIO/MMC, PWM

### Use Cases
- IoT devices requiring Wi-Fi connectivity
- Bluetooth audio streaming
- General-purpose embedded applications
- Home automation

---

## ESP32-S2

**Official Name:** ESP32-S2 (ESP32-S2FH4, ESP32-S2FN4R2)

### Wireless Connectivity
- **Wi-Fi:** ✅ Yes (802.11 b/g/n, 2.4 GHz)
- **Bluetooth:** ❌ No
- **Thread:** ❌ No
- **Zigbee:** ❌ No

### Key Specifications
- **CPU:** Single-core Xtensa LX7, up to 240 MHz
- **RAM:** 320 KB SRAM
- **Flash:** External (typically 4 MB) or embedded (up to 4 MB)
- **GPIO:** Up to 43 programmable GPIOs
- **ADC:** 20 channels, 13-bit SAR ADC
- **DAC:** 2 channels, 8-bit DAC
- **USB:** Native USB OTG 1.1
- **Interfaces:** SPI, I2C, I2S, UART, LCD, Camera, Touch sensors

### Use Cases
- Wi-Fi-only IoT devices
- USB HID devices (keyboards, mice)
- Applications requiring more GPIOs
- Battery-powered devices (improved power efficiency)

---

## ESP32-S3

**Official Name:** ESP32-S3 (ESP32-S3FH4R2, ESP32-S3R8, ESP32-S3FN8)

### Wireless Connectivity
- **Wi-Fi:** ✅ Yes (802.11 b/g/n, 2.4 GHz)
- **Bluetooth:** ✅ Yes (Bluetooth 5.0 LE)
- **Thread:** ❌ No
- **Zigbee:** ❌ No

### Key Specifications
- **CPU:** Dual-core Xtensa LX7, up to 240 MHz
- **RAM:** 512 KB SRAM, 16 KB SRAM in RTC
- **PSRAM:** Optional (up to 8 MB)
- **Flash:** External (typically 8 MB) or embedded
- **GPIO:** Up to 45 programmable GPIOs
- **ADC:** 20 channels, 12-bit SAR ADC
- **USB:** Native USB OTG 1.1
- **AI Acceleration:** Vector instructions for neural network processing
- **Interfaces:** SPI, I2C, I2S, UART, LCD, Camera, Touch sensors, SD/SDIO/MMC

### Use Cases
- AI/ML applications at the edge
- Voice recognition and audio processing
- Video streaming and image processing
- High-performance IoT devices
- Smart displays and cameras

---

## ESP32-C3

**Official Name:** ESP32-C3 (ESP32-C3FH4, ESP32-C3FN4)

### Wireless Connectivity
- **Wi-Fi:** ✅ Yes (802.11 b/g/n, 2.4 GHz)
- **Bluetooth:** ✅ Yes (Bluetooth 5.0 LE)
- **Thread:** ❌ No
- **Zigbee:** ❌ No

### Key Specifications
- **CPU:** Single-core RISC-V, up to 160 MHz
- **RAM:** 400 KB SRAM
- **Flash:** External (typically 4 MB) or embedded
- **GPIO:** Up to 22 programmable GPIOs
- **ADC:** 6 channels, 12-bit SAR ADC
- **Interfaces:** SPI, I2C, I2S, UART, TWAI (CAN 2.0)

### Use Cases
- Cost-sensitive IoT applications
- RISC-V development and learning
- Low-power Wi-Fi + BLE devices
- Simple automation projects

---

## ESP32-C6

**Official Name:** ESP32-C6 (ESP32-C6FH4)

### Wireless Connectivity
- **Wi-Fi:** ✅ Yes (802.11 b/g/n, 802.11ax, 2.4 GHz - Wi-Fi 6)
- **Bluetooth:** ✅ Yes (Bluetooth 5.3 LE)
- **Thread:** ✅ Yes (IEEE 802.15.4)
- **Zigbee:** ✅ Yes (IEEE 802.15.4)

### Key Specifications
- **CPU:** Single-core RISC-V, up to 160 MHz
- **RAM:** 512 KB SRAM
- **Flash:** External (typically 4 MB) or embedded
- **GPIO:** Up to 30 programmable GPIOs
- **ADC:** 7 channels, 12-bit SAR ADC
- **Interfaces:** SPI, I2C, I2S, UART, TWAI (CAN 2.0), USB Serial/JTAG

### Use Cases
- **Matter** protocol devices (Thread + Wi-Fi)
- Smart home hubs and bridges
- Zigbee gateway devices
- Thread border routers
- Multi-protocol IoT applications

---

## ESP32-H2

**Official Name:** ESP32-H2 (ESP32-H2FH4)

### Wireless Connectivity
- **Wi-Fi:** ❌ **No** (This is the key differentiator!)
- **Bluetooth:** ✅ Yes (Bluetooth 5.2 LE)
- **Thread:** ✅ Yes (IEEE 802.15.4)
- **Zigbee:** ✅ Yes (IEEE 802.15.4)

### Key Specifications
- **CPU:** Single-core RISC-V, up to 96 MHz
- **RAM:** 320 KB SRAM
- **Flash:** External (typically 2-4 MB) or embedded
- **GPIO:** Up to 26 programmable GPIOs
- **ADC:** 5 channels, 12-bit SAR ADC
- **Interfaces:** SPI, I2C, I2S, UART

### Use Cases
- **Thread-only** devices (no Wi-Fi needed)
- **Zigbee** end devices and routers
- Low-power mesh network nodes
- BLE beacon devices
- Battery-powered sensors in Thread/Zigbee networks
- Matter-over-Thread devices

---

## ESP32-C2 (ESP8684)

**Official Name:** ESP32-C2 (ESP8684)

### Wireless Connectivity
- **Wi-Fi:** ✅ Yes (802.11 b/g/n, 2.4 GHz)
- **Bluetooth:** ✅ Yes (Bluetooth 5.0 LE)
- **Thread:** ❌ No
- **Zigbee:** ❌ No

### Key Specifications
- **CPU:** Single-core RISC-V, up to 120 MHz
- **RAM:** 272 KB SRAM
- **Flash:** Embedded (2 MB or 4 MB)
- **GPIO:** Up to 14 programmable GPIOs
- **ADC:** 3 channels, 12-bit SAR ADC
- **Interfaces:** SPI, I2C, I2S, UART

### Use Cases
- Ultra-low-cost IoT devices
- Simple Wi-Fi connectivity
- Entry-level smart home devices
- Replacement for ESP8266

---

## ESP32-P4

**Official Name:** ESP32-P4 (Upcoming/Announced)

### Wireless Connectivity
- **Wi-Fi:** ❌ No (Requires external module)
- **Bluetooth:** ❌ No (Requires external module)
- **Thread:** ❌ No
- **Zigbee:** ❌ No

### Key Specifications
- **CPU:** Dual-core RISC-V, up to 400 MHz
- **RAM:** 768 KB SRAM
- **AI Acceleration:** Enhanced for computer vision and ML
- **Display:** Support for high-resolution displays
- **Interfaces:** USB 2.0 OTG, Ethernet, Camera interface

### Use Cases
- High-performance HMI (Human-Machine Interface)
- Computer vision applications
- Industrial control panels
- Applications with external Wi-Fi module

---

## Quick Reference Table

### Wireless Connectivity Matrix

| Chip | Wi-Fi | Bluetooth | Thread | Zigbee | CPU Cores | Architecture | Main Use Case |
|------|-------|-----------|--------|--------|-----------|--------------|---------------|
| **ESP32** | ✅ Wi-Fi 4 | ✅ 4.2 | ❌ | ❌ | 2 | Xtensa LX6 | General IoT |
| **ESP32-S2** | ✅ Wi-Fi 4 | ❌ | ❌ | ❌ | 1 | Xtensa LX7 | Wi-Fi only, USB |
| **ESP32-S3** | ✅ Wi-Fi 4 | ✅ 5.0 LE | ❌ | ❌ | 2 | Xtensa LX7 | AI/ML, Camera |
| **ESP32-C3** | ✅ Wi-Fi 4 | ✅ 5.0 LE | ❌ | ❌ | 1 | RISC-V | Low cost |
| **ESP32-C6** | ✅ Wi-Fi 6 | ✅ 5.3 LE | ✅ | ✅ | 1 | RISC-V | Matter, Multi-protocol |
| **ESP32-H2** | ❌ **No** | ✅ 5.2 LE | ✅ | ✅ | 1 | RISC-V | Thread/Zigbee only |
| **ESP32-C2** | ✅ Wi-Fi 4 | ✅ 5.0 LE | ❌ | ❌ | 1 | RISC-V | Ultra low cost |

---

### Complete Specifications Table

| Feature | ESP32 | ESP32-S2 | ESP32-S3 | ESP32-C3 | ESP32-C6 | ESP32-H2 | ESP32-C2 |
|---------|-------|----------|----------|----------|----------|----------|----------|
| **Wireless Connectivity** |
| Wi-Fi Version | Wi-Fi 4 | Wi-Fi 4 | Wi-Fi 4 | Wi-Fi 4 | Wi-Fi 6 | ❌ | Wi-Fi 4 |
| Wi-Fi Standard | 802.11n | 802.11n | 802.11n | 802.11n | 802.11ax | ❌ | 802.11n |
| Wi-Fi Frequency | 2.4 GHz | 2.4 GHz | 2.4 GHz | 2.4 GHz | 2.4 GHz | ❌ | 2.4 GHz |
| Bluetooth Classic | ✅ (4.2) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bluetooth LE | ✅ (4.2) | ❌ | ✅ (5.0) | ✅ (5.0) | ✅ (5.3) | ✅ (5.2) | ✅ (5.0) |
| Thread | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Zigbee | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| IEEE 802.15.4 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Processor** |
| CPU Architecture | Xtensa LX6 | Xtensa LX7 | Xtensa LX7 | RISC-V | RISC-V | RISC-V | RISC-V |
| CPU Cores | 2 | 1 | 2 | 1 | 1 | 1 | 1 |
| Max Clock Speed | 240 MHz | 240 MHz | 240 MHz | 160 MHz | 160 MHz | 96 MHz | 120 MHz |
| **Memory** |
| SRAM | 520 KB | 320 KB | 512 KB | 400 KB | 512 KB | 320 KB | 272 KB |
| ROM | 448 KB | 128 KB | 384 KB | 384 KB | 320 KB | 128 KB | 576 KB |
| PSRAM (Max) | - | - | 8 MB | - | - | - | - |
| Flash (Typical) | 4 MB | 4 MB | 8 MB | 4 MB | 4 MB | 4 MB | 2-4 MB |
| **GPIO & Peripherals** |
| GPIO Pins (Max) | 34 | 43 | 45 | 22 | 30 | 26 | 14 |
| ADC Channels | 18 | 20 | 20 | 6 | 7 | 5 | 3 |
| ADC Resolution | 12-bit | 13-bit | 12-bit | 12-bit | 12-bit | 12-bit | 12-bit |
| DAC Channels | 2 | 2 | - | - | - | - | - |
| Touch Sensors | 10 | 14 | 14 | - | - | - | - |
| **Interfaces** |
| SPI | ✅ (4) | ✅ (4) | ✅ (4) | ✅ (3) | ✅ (2) | ✅ (2) | ✅ (2) |
| I2C | ✅ (2) | ✅ (2) | ✅ (2) | ✅ (1) | ✅ (2) | ✅ (2) | ✅ (1) |
| I2S | ✅ (2) | ✅ (1) | ✅ (2) | ✅ (1) | ✅ (1) | ✅ (1) | ✅ (1) |
| UART | ✅ (3) | ✅ (2) | ✅ (3) | ✅ (2) | ✅ (3) | ✅ (2) | ✅ (2) |
| USB OTG | ❌ | ✅ (1.1) | ✅ (1.1) | ❌ | ✅ (Serial) | ❌ | ❌ |
| CAN / TWAI | ✅ | - | ✅ | ✅ | ✅ | - | - |
| Ethernet MAC | ✅ | - | - | - | - | - | - |
| SD/SDIO/MMC | ✅ | ✅ | ✅ | - | - | - | - |
| Camera Interface | - | ✅ | ✅ | - | - | - | - |
| LCD Interface | - | ✅ | ✅ | - | - | - | - |
| **Special Features** |
| AI Acceleration | - | - | ✅ | - | - | - | - |
| Security | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crypto Engine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RTC | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Low Power Modes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Matter Support** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Typical Price Range** | $3-5 | $2-4 | $4-7 | $2-3 | $3-5 | $2-4 | $1-2 |

---

### Use Case Comparison

| Use Case | Best Chip Choice | Why? |
|----------|------------------|------|
| **General IoT with Wi-Fi + BT** | ESP32 (Classic) or ESP32-C3 | Proven, widely supported, good balance |
| **AI/ML Applications** | ESP32-S3 | AI acceleration, PSRAM, dual-core |
| **Camera/Display Projects** | ESP32-S3 or ESP32-S2 | Camera interface, LCD support |
| **USB HID Devices** | ESP32-S2 or ESP32-S3 | Native USB OTG support |
| **Matter-over-Wi-Fi** | ESP32-C6 | Wi-Fi 6 + Thread/Zigbee support |
| **Matter-over-Thread (no Wi-Fi)** | ESP32-H2 | Thread/Zigbee only, lowest power |
| **Thread Border Router** | ESP32-C6 | Wi-Fi + Thread support |
| **Zigbee End Device** | ESP32-H2 or ESP32-C6 | IEEE 802.15.4 radio |
| **Ultra Low Cost** | ESP32-C2 | Cheapest option with Wi-Fi + BLE |
| **Battery-Powered Wi-Fi** | ESP32-S2 or ESP32-C2 | Single core, better power efficiency |
| **RISC-V Development** | ESP32-C3, C6, or H2 | All use RISC-V architecture |
| **High GPIO Count** | ESP32-S3 (45) or ESP32-S2 (43) | Maximum GPIO pins |
| **Ethernet Projects** | ESP32 (Classic) | Only chip with Ethernet MAC |
| **Audio Streaming (A2DP)** | ESP32 (Classic) | Only chip with Bluetooth Classic |

---

### Power Consumption Comparison

| Chip | Active Mode (Wi-Fi TX) | Light Sleep | Deep Sleep | Notes |
|------|------------------------|-------------|------------|-------|
| **ESP32** | ~240 mA | ~0.8 mA | ~10 μA | Dual-core increases power |
| **ESP32-S2** | ~190 mA | ~0.75 mA | ~5 μA | Single core, more efficient |
| **ESP32-S3** | ~250 mA | ~0.9 mA | ~7 μA | AI features use more power |
| **ESP32-C3** | ~180 mA | ~0.7 mA | ~5 μA | RISC-V efficient |
| **ESP32-C6** | ~200 mA | ~0.8 mA | ~7 μA | Multi-radio increases power |
| **ESP32-H2** | ~45 mA* | ~0.6 mA | ~5 μA | No Wi-Fi = lowest power |
| **ESP32-C2** | ~170 mA | ~0.65 mA | ~5 μA | Most power efficient with Wi-Fi |

*ESP32-H2 power is for Thread/BLE, not Wi-Fi (which it doesn't have)

---

## Categorization Guidelines

### When categorizing products in the database:

1. **Identify the chip variant** from the product title, ASIN, or description
   - Look for: "ESP32-S3", "ESP32-C6", "ESP32-H2", etc.
   - Classic ESP32 may not have a suffix

2. **Set wireless capabilities** based on the chip type:
   - Use the table above as the definitive reference
   - **IMPORTANT:** ESP32-H2 has NO Wi-Fi (common mistake!)

3. **Verify PSRAM and Flash** from product specifications:
   - PSRAM: Look for "PSRAM", "8MB PSRAM", "Octal SPI RAM"
   - Flash: Look for "4MB Flash", "8MB Flash", "16MB Flash"

4. **Count GPIO pins** from the development board:
   - This varies by dev board, not just the chip
   - Some boards expose fewer GPIOs than the chip supports

5. **Check for USB support**:
   - ESP32-S2, ESP32-S3, ESP32-C6: Native USB
   - ESP32 (classic), ESP32-C3: USB via serial chip (CH340, CP2102, etc.)

6. **Identify special features**:
   - Camera support: ESP32-S3, ESP32-S2
   - AI acceleration: ESP32-S3
   - Matter protocol: ESP32-C6, ESP32-H2
   - Wi-Fi 6: ESP32-C6

---

## Common Mistakes to Avoid

1. ❌ **Assuming all ESP32 chips have Wi-Fi**
   - ESP32-H2 does NOT have Wi-Fi!
   - ESP32-P4 requires external Wi-Fi module

2. ❌ **Confusing Bluetooth versions**
   - Classic ESP32: Bluetooth 4.2 (BR/EDR + BLE)
   - Newer chips: Bluetooth 5.x LE only (no BR/EDR)

3. ❌ **Mixing up Thread and Zigbee support**
   - Only ESP32-C6 and ESP32-H2 support Thread/Zigbee
   - Both use IEEE 802.15.4 radio

4. ❌ **Assuming USB support**
   - Only S2, S3, C6 have native USB
   - Others use USB-to-serial chips

5. ❌ **Ignoring PSRAM differences**
   - ESP32-S3 commonly has PSRAM (important for AI/camera)
   - Other chips rarely include PSRAM

---

## Resources

- [Espressif Official Product Selector](https://products.espressif.com/)
- [ESP32 Series Datasheet](https://www.espressif.com/en/products/socs)
- [ESP-IDF Documentation](https://docs.espressif.com/projects/esp-idf/)
- [Matter Protocol Support](https://github.com/espressif/esp-matter)

---

## Revision History

- **v1.0** (2025-11-26): Initial documentation
  - Added all major ESP32 variants
  - Included wireless connectivity matrix
  - Added categorization guidelines

---

**Last Updated:** November 26, 2025
