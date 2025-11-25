import { d as defineEventHandler, g as getQuery, c as createError } from '../../../nitro/nitro.mjs';
import { c as createServerSupabaseAdminClient } from '../../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const products_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const marketplace = query.marketplace;
  const status = query.status;
  const search = query.search;
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  if (marketplace && !["US", "DE"].includes(marketplace)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid marketplace. Must be "US" or "DE"'
    });
  }
  if (status && !["draft", "active", "unavailable"].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid status. Must be "draft", "active", or "unavailable"'
    });
  }
  try {
    const adminClient = createServerSupabaseAdminClient();
    let marketplaceId;
    if (marketplace) {
      const { data: marketplaceData, error: marketplaceError } = await adminClient.from("marketplaces").select("id").eq("code", marketplace).single();
      if (marketplaceError || !marketplaceData) {
        throw createError({
          statusCode: 404,
          message: `Marketplace "${marketplace}" not found`
        });
      }
      marketplaceId = marketplaceData.id;
    }
    let productsQuery = adminClient.from("products").select(`
        id,
        asin,
        title,
        description,
        brand,
        images,
        detail_page_url,
        current_price,
        original_price,
        savings_percentage,
        currency,
        status,
        last_refresh_at,
        created_at,
        updated_at,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency
        )
      `, { count: "exact" });
    if (marketplaceId) {
      productsQuery = productsQuery.eq("marketplace_id", marketplaceId);
    }
    if (status) {
      productsQuery = productsQuery.eq("status", status);
    }
    if (search) {
      productsQuery = productsQuery.or(`title.ilike.%${search}%,asin.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    productsQuery = productsQuery.order("created_at", { ascending: false }).range(from, to);
    const { data: products, error, count } = await productsQuery;
    if (error) {
      console.error("Failed to fetch products:", error);
      throw createError({
        statusCode: 500,
        message: "Failed to fetch products"
      });
    }
    return {
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    console.error("Admin products API error:", error);
    throw error;
  }
});

export { products_get as default };
//# sourceMappingURL=products.get.mjs.map
