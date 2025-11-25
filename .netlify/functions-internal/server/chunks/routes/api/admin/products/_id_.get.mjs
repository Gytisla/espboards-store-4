import { d as defineEventHandler, a as getRouterParam, c as createError } from '../../../../nitro/nitro.mjs';
import { c as createServerSupabaseAdminClient } from '../../../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Product ID is required"
    });
  }
  try {
    const adminClient = createServerSupabaseAdminClient();
    const { data: product, error } = await adminClient.from("products").select(`
        *,
        marketplace:marketplaces!marketplace_id (
          id,
          code,
          region_name,
          currency,
          paapi_endpoint
        )
      `).eq("id", id).single();
    if (error) {
      console.error("Failed to fetch product:", error);
      if (error.code === "PGRST116") {
        throw createError({
          statusCode: 404,
          message: "Product not found"
        });
      }
      throw createError({
        statusCode: 500,
        message: "Failed to fetch product"
      });
    }
    return {
      product
    };
  } catch (error) {
    console.error("Get product API error:", error);
    throw error;
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
