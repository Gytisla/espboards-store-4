import { d as defineEventHandler, r as readBody, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const import_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { asin, marketplace } = body;
    if (!asin || typeof asin !== "string") {
      throw createError({
        statusCode: 400,
        message: "Missing or invalid ASIN"
      });
    }
    if (!marketplace || !["US", "DE"].includes(marketplace)) {
      throw createError({
        statusCode: 400,
        message: "Invalid marketplace. Must be US or DE"
      });
    }
    const config = useRuntimeConfig();
    const supabaseUrl = config.public.supabaseUrl;
    const supabaseAnonKey = config.public.supabaseKey;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        message: "Supabase configuration missing"
      });
    }
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/import-product`;
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        asin,
        marketplace
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let message = errorData.error || "Failed to import product";
      if (response.status === 400) {
        message = errorData.error || "Invalid product data";
      } else if (response.status === 404) {
        message = "Product not found on Amazon";
      } else if (response.status === 409) {
        message = "Product already imported";
      } else if (response.status === 503) {
        message = "Amazon API temporarily unavailable";
      }
      throw createError({
        statusCode: response.status,
        message
      });
    }
    const data = await response.json();
    return {
      success: true,
      product: data.product,
      message: "Product imported successfully"
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Unexpected error in import API route:", error);
    throw createError({
      statusCode: 500,
      message: "An unexpected error occurred while importing the product"
    });
  }
});

export { import_post as default };
//# sourceMappingURL=import.post.mjs.map
