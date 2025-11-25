import { d as defineEventHandler, g as getQuery, c as createError } from '../../nitro/nitro.mjs';
import { a as createServerSupabaseClient } from '../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const marketplace = query.marketplace;
  if (marketplace && !["US", "DE"].includes(marketplace)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid marketplace. Must be "US" or "DE"'
    });
  }
  try {
    const supabase = await createServerSupabaseClient(event);
    let productsQuery = supabase.from("products").select(`
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
        raw_paapi_response,
        created_at,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `).eq("status", "active").order("created_at", { ascending: false });
    if (marketplace) {
      const { data: marketplaceData, error: marketplaceError } = await supabase.from("marketplaces").select("id").eq("code", marketplace).single();
      if (marketplaceError || !marketplaceData) {
        throw createError({
          statusCode: 404,
          message: `Marketplace "${marketplace}" not found`
        });
      }
      productsQuery = productsQuery.eq("marketplace_id", marketplaceData.id);
    }
    const { data: products, error } = await productsQuery;
    if (error) {
      console.error("Failed to fetch products:", error);
      throw createError({
        statusCode: 500,
        message: "Failed to fetch products"
      });
    }
    return {
      products: products || [],
      count: (products == null ? void 0 : products.length) || 0
    };
  } catch (error) {
    console.error("Products API error:", error);
    throw error;
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
