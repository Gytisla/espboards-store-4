-- Seed Data: Test ESP32 Products for Development
-- Description: Sample products for testing import/refresh workflows without PA-API calls
-- Usage: Automatically loaded during `supabase db reset`
-- Note: Uses realistic product data based on real ESP32 boards from Amazon

-- ============================================================================
-- TEST PRODUCTS
-- ============================================================================
-- Purpose: Provide test data for development and testing
-- - Product 1: Active ESP32-DevKitC (most popular development board)
-- - Product 2: Active ESP32-CAM (camera module)
-- - Product 3: Draft ESP32-WROOM-32 (raw module, not yet published)

-- Get marketplace IDs for reference
-- US Marketplace: Use for products 1 and 3
-- DE Marketplace: Use for product 2

-- ============================================================================
-- PRODUCT 1: ESP32-DevKitC-32UE (Active, US Marketplace)
-- ============================================================================
-- Real ASIN: B08DQQ8CBP
-- Status: Active (visible to public via RLS policy)
-- Description: Popular ESP32 development board with USB-C

INSERT INTO products (
    asin,
    marketplace_id,
    title,
    description,
    brand,
    manufacturer,
    images,
    detail_page_url,
    current_price,
    original_price,
    savings_amount,
    savings_percentage,
    currency,
    availability_type,
    availability_message,
    customer_review_count,
    star_rating,
    status,
    last_refresh_at,
    raw_paapi_response,
    created_at,
    updated_at
) VALUES (
    'B08DQQ8CBP',
    (SELECT id FROM marketplaces WHERE code = 'US'),
    'ESP32-DevKitC-32UE Development Board with ESP32-WROOM-32UE Module',
    'ESP32-DevKitC-32UE is an entry-level development board based on ESP32-WROOM-32UE, a general-purpose module with 4MB flash. This board integrates complete Wi-Fi and Bluetooth® Low Energy functions.',
    'Espressif Systems',
    'Espressif Systems',
    '[
        {
            "variant": "MAIN",
            "large": "https://m.media-amazon.com/images/I/61J5vH5KKFL._AC_SL1500_.jpg",
            "medium": "https://m.media-amazon.com/images/I/61J5vH5KKFL._AC_SL1000_.jpg",
            "small": "https://m.media-amazon.com/images/I/61J5vH5KKFL._AC_SL500_.jpg"
        }
    ]'::jsonb,
    'https://www.amazon.com/dp/B08DQQ8CBP',
    23.99,
    29.99,
    6.00,
    20.01,
    'USD',
    'NOW',
    'In Stock',
    342,
    4.6,
    'active',
    NOW() - INTERVAL '12 hours',
    '{
        "ItemsResult": {
            "Items": [{
                "ASIN": "B08DQQ8CBP",
                "DetailPageURL": "https://www.amazon.com/dp/B08DQQ8CBP",
                "ItemInfo": {
                    "Title": {
                        "DisplayValue": "ESP32-DevKitC-32UE Development Board with ESP32-WROOM-32UE Module"
                    },
                    "ByLineInfo": {
                        "Brand": {
                            "DisplayValue": "Espressif Systems"
                        },
                        "Manufacturer": {
                            "DisplayValue": "Espressif Systems"
                        }
                    }
                },
                "Offers": {
                    "Listings": [{
                        "Price": {
                            "Amount": 23.99,
                            "Currency": "USD"
                        },
                        "SavingBasis": {
                            "Amount": 29.99,
                            "Currency": "USD"
                        },
                        "Availability": {
                            "Type": "NOW",
                            "Message": "In Stock"
                        }
                    }]
                },
                "CustomerReviews": {
                    "Count": 342,
                    "StarRating": 4.6
                }
            }]
        }
    }'::jsonb,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '12 hours'
);

-- ============================================================================
-- PRODUCT 2: ESP32-CAM WiFi Bluetooth Camera Module (Active, DE Marketplace)
-- ============================================================================
-- Real ASIN: B07RXPHYNM
-- Status: Active (visible to public via RLS policy)
-- Description: ESP32-CAM with OV2640 camera module for IoT projects

INSERT INTO products (
    asin,
    marketplace_id,
    title,
    description,
    brand,
    manufacturer,
    images,
    detail_page_url,
    current_price,
    original_price,
    savings_amount,
    savings_percentage,
    currency,
    availability_type,
    availability_message,
    customer_review_count,
    star_rating,
    status,
    last_refresh_at,
    raw_paapi_response,
    created_at,
    updated_at
) VALUES (
    'B07RXPHYNM',
    (SELECT id FROM marketplaces WHERE code = 'DE'),
    'ESP32-CAM WiFi Bluetooth Kamera Modul Entwicklungsboard mit OV2640',
    'ESP32-CAM ist ein kleines Kameramodul mit geringem Stromverbrauch, das auf ESP32 basiert. Es verfügt über ein eingebautes WiFi- und Bluetooth-Modul und kann unabhängig als Minimum-System arbeiten.',
    'AZ-Delivery',
    'AZ-Delivery',
    '[
        {
            "variant": "MAIN",
            "large": "https://m.media-amazon.com/images/I/61tYGz5P8PL._AC_SL1500_.jpg",
            "medium": "https://m.media-amazon.com/images/I/61tYGz5P8PL._AC_SL1000_.jpg",
            "small": "https://m.media-amazon.com/images/I/61tYGz5P8PL._AC_SL500_.jpg"
        }
    ]'::jsonb,
    'https://www.amazon.de/dp/B07RXPHYNM',
    9.99,
    14.99,
    5.00,
    33.36,
    'EUR',
    'NOW',
    'Auf Lager',
    1247,
    4.4,
    'active',
    NOW() - INTERVAL '8 hours',
    '{
        "ItemsResult": {
            "Items": [{
                "ASIN": "B07RXPHYNM",
                "DetailPageURL": "https://www.amazon.de/dp/B07RXPHYNM",
                "ItemInfo": {
                    "Title": {
                        "DisplayValue": "ESP32-CAM WiFi Bluetooth Kamera Modul Entwicklungsboard mit OV2640"
                    },
                    "ByLineInfo": {
                        "Brand": {
                            "DisplayValue": "AZ-Delivery"
                        },
                        "Manufacturer": {
                            "DisplayValue": "AZ-Delivery"
                        }
                    }
                },
                "Offers": {
                    "Listings": [{
                        "Price": {
                            "Amount": 9.99,
                            "Currency": "EUR"
                        },
                        "SavingBasis": {
                            "Amount": 14.99,
                            "Currency": "EUR"
                        },
                        "Availability": {
                            "Type": "NOW",
                            "Message": "Auf Lager"
                        }
                    }]
                },
                "CustomerReviews": {
                    "Count": 1247,
                    "StarRating": 4.4
                }
            }]
        }
    }'::jsonb,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '8 hours'
);

-- ============================================================================
-- PRODUCT 3: ESP32-WROOM-32 Module (Draft, US Marketplace)
-- ============================================================================
-- Real ASIN: B08246MCL5
-- Status: Draft (not visible to public, testing internal workflows)
-- Description: Raw ESP32 module for custom PCB integration
-- Note: Never refreshed (last_refresh_at IS NULL) - good for testing refresh worker

INSERT INTO products (
    asin,
    marketplace_id,
    title,
    description,
    brand,
    manufacturer,
    images,
    detail_page_url,
    current_price,
    original_price,
    currency,
    availability_type,
    availability_message,
    customer_review_count,
    star_rating,
    status,
    last_refresh_at,
    raw_paapi_response,
    created_at,
    updated_at
) VALUES (
    'B08246MCL5',
    (SELECT id FROM marketplaces WHERE code = 'US'),
    'ESP32-WROOM-32 ESP-32 WiFi/BT/BLE MCU Module',
    'ESP32-WROOM-32 is a powerful, generic WiFi-BT-BLE MCU module that targets a wide variety of applications. At the core of this module is the ESP32-D0WDQ6 chip.',
    'Espressif',
    'Espressif Systems',
    '[
        {
            "variant": "MAIN",
            "large": "https://m.media-amazon.com/images/I/51xN8GF9PNL._AC_SL1500_.jpg",
            "medium": "https://m.media-amazon.com/images/I/51xN8GF9PNL._AC_SL1000_.jpg",
            "small": "https://m.media-amazon.com/images/I/51xN8GF9PNL._AC_SL500_.jpg"
        }
    ]'::jsonb,
    'https://www.amazon.com/dp/B08246MCL5',
    4.95,
    6.95,
    'USD',
    'NOW',
    'In Stock',
    89,
    4.3,
    'draft',
    NULL,  -- Never refreshed - will be picked up by refresh worker
    '{
        "ItemsResult": {
            "Items": [{
                "ASIN": "B08246MCL5",
                "DetailPageURL": "https://www.amazon.com/dp/B08246MCL5",
                "ItemInfo": {
                    "Title": {
                        "DisplayValue": "ESP32-WROOM-32 ESP-32 WiFi/BT/BLE MCU Module"
                    },
                    "ByLineInfo": {
                        "Brand": {
                            "DisplayValue": "Espressif"
                        },
                        "Manufacturer": {
                            "DisplayValue": "Espressif Systems"
                        }
                    }
                },
                "Offers": {
                    "Listings": [{
                        "Price": {
                            "Amount": 4.95,
                            "Currency": "USD"
                        },
                        "SavingBasis": {
                            "Amount": 6.95,
                            "Currency": "USD"
                        },
                        "Availability": {
                            "Type": "NOW",
                            "Message": "In Stock"
                        }
                    }]
                },
                "CustomerReviews": {
                    "Count": 89,
                    "StarRating": 4.3
                }
            }]
        }
    }'::jsonb,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after seed to verify data loaded correctly:
--
-- 1. Count products by status:
-- SELECT status, COUNT(*) FROM products GROUP BY status;
-- Expected: active=2, draft=1
--
-- 2. Count products by marketplace:
-- SELECT m.code, COUNT(p.*) 
-- FROM marketplaces m 
-- LEFT JOIN products p ON p.marketplace_id = m.id 
-- GROUP BY m.code;
-- Expected: US=2, DE=1
--
-- 3. List all seeded products:
-- SELECT 
--     p.asin,
--     m.code AS marketplace,
--     p.title,
--     p.current_price,
--     p.currency,
--     p.status,
--     p.last_refresh_at
-- FROM products p
-- JOIN marketplaces m ON p.marketplace_id = m.id
-- ORDER BY p.created_at;
--
-- 4. Test RLS policy (public can only see active products):
-- SET ROLE anon;
-- SELECT asin, title, status FROM products;
-- Expected: Only 2 products (B08DQQ8CBP, B07RXPHYNM), no draft product
-- RESET ROLE;
--
-- 5. Verify products needing refresh (view from T013):
-- SELECT * FROM v_products_needing_refresh;
-- Expected: B08246MCL5 (last_refresh_at IS NULL)

-- ============================================================================
-- TESTING USE CASES
-- ============================================================================
-- These seed products support the following test scenarios:
--
-- 1. Import Product Testing (T037-T041):
--    - Use different ASINs to avoid conflicts
--    - Test duplicate import with B08DQQ8CBP (should update, not insert)
--
-- 2. Refresh Worker Testing (T066-T069):
--    - Product B08246MCL5 has NULL last_refresh_at (will be picked up)
--    - Manually set last_refresh_at to >24h ago to test refresh logic
--
-- 3. RLS Policy Testing (T015 verification):
--    - Product B08246MCL5 is draft (hidden from public)
--    - Products B08DQQ8CBP and B07RXPHYNM are active (visible to public)
--
-- 4. Circuit Breaker Testing (T070):
--    - Refresh these products to trigger PA-API calls
--    - Simulate failures to test circuit breaker behavior
--
-- 5. Health Check Testing (T078-T079):
--    - Database should return healthy with these products
--    - Test query performance with seeded data

-- ============================================================================
-- ADDITIONAL TEST DATA (Optional)
-- ============================================================================
-- Uncomment to add more test products if needed:

-- -- Product 4: Unavailable Product (for testing unavailability handling)
-- INSERT INTO products (
--     asin,
--     marketplace_id,
--     title,
--     status,
--     last_available_at,
--     last_refresh_at,
--     created_at,
--     updated_at
-- ) VALUES (
--     'B0TESTUNAV',
--     (SELECT id FROM marketplaces WHERE code = 'US'),
--     'Test Unavailable ESP32 Board',
--     'unavailable',
--     NOW() - INTERVAL '30 days',
--     NOW() - INTERVAL '1 day',
--     NOW() - INTERVAL '60 days',
--     NOW() - INTERVAL '1 day'
-- );

-- -- Product 5: Old Product (needs refresh >24h ago)
-- INSERT INTO products (
--     asin,
--     marketplace_id,
--     title,
--     status,
--     last_refresh_at,
--     created_at,
--     updated_at
-- ) VALUES (
--     'B0TESTOLD1',
--     (SELECT id FROM marketplaces WHERE code = 'US'),
--     'Test Old ESP32 Board Needing Refresh',
--     'active',
--     NOW() - INTERVAL '48 hours',
--     NOW() - INTERVAL '90 days',
--     NOW() - INTERVAL '48 hours'
-- );

-- ============================================================================
-- CLEANUP (if needed during development)
-- ============================================================================
-- To remove all seeded products and start fresh:
-- DELETE FROM products WHERE asin IN ('B08DQQ8CBP', 'B07RXPHYNM', 'B08246MCL5');
-- 
-- To reset only products needing refresh:
-- UPDATE products SET last_refresh_at = NULL WHERE asin = 'B08246MCL5';
-- 
-- To simulate old products needing refresh:
-- UPDATE products SET last_refresh_at = NOW() - INTERVAL '48 hours' WHERE asin IN ('B08DQQ8CBP', 'B07RXPHYNM');
