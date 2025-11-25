import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../nitro/nitro.mjs';
import { a as createServerSupabaseClient } from '../../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const _id__get = defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "id");
  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Product slug is required"
    });
  }
  try {
    const supabase = await createServerSupabaseClient(event);
    const { data: product, error } = await supabase.from("products").select(`
        id,
        asin,
        slug,
        title,
        description,
        brand,
        images,
        detail_page_url,
        current_price,
        original_price,
        savings_amount,
        savings_percentage,
        currency,
        status,
        metadata,
        created_at,
        last_refresh_at,
        features,
        product_info,
        manufacture_info,
        raw_paapi_response,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `).eq("slug", slug).eq("status", "active").single();
    if (error) {
      console.error("Failed to fetch product:", error);
      throw createError({
        statusCode: error.code === "PGRST116" ? 404 : 500,
        message: error.code === "PGRST116" ? "Product not found" : "Failed to fetch product"
      });
    }
    return {
      product
    };
  } catch (error) {
    console.error("Product API error:", error);
    throw error;
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
