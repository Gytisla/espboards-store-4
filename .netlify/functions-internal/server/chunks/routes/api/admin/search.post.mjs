import { d as defineEventHandler, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import { a as createServerSupabaseClient, c as createServerSupabaseAdminClient } from '../../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const search_post = defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      message: "Method not allowed"
    });
  }
  const body = await readBody(event);
  const { query, marketplace } = body;
  if (!query || typeof query !== "string" || query.trim().length < 2) {
    throw createError({
      statusCode: 400,
      message: "Search query must be at least 2 characters long"
    });
  }
  if (!marketplace || typeof marketplace !== "string" || !["US", "DE"].includes(marketplace)) {
    throw createError({
      statusCode: 400,
      message: 'Marketplace must be either "US" or "DE"'
    });
  }
  try {
    const supabase = await createServerSupabaseClient(event);
    const { data, error } = await supabase.functions.invoke("search-products", {
      body: {
        query: query.trim(),
        marketplace
      }
    });
    if (error) {
      console.error("Edge function error:", error);
      throw createError({
        statusCode: 500,
        message: "Failed to search products"
      });
    }
    const results = (data == null ? void 0 : data.results) || [];
    const asins = results.map((product) => product.asin).filter(Boolean);
    let importedAsins = /* @__PURE__ */ new Set();
    if (asins.length > 0) {
      const adminClient = createServerSupabaseAdminClient();
      console.log("Checking ASINs:", asins);
      console.log("Marketplace code:", marketplace);
      const { data: marketplaceData, error: marketplaceError } = await adminClient.from("marketplaces").select("id").eq("code", marketplace).single();
      console.log("Marketplace data:", marketplaceData);
      console.log("Marketplace error:", marketplaceError);
      if (!marketplaceError && marketplaceData) {
        const marketplaceId = marketplaceData.id;
        console.log("Marketplace ID:", marketplaceId);
        const { data: existingProducts, error: dbError } = await adminClient.from("products").select("asin").eq("marketplace_id", marketplaceId).in("asin", asins);
        console.log("Database query error:", dbError);
        console.log("Existing products:", existingProducts);
        console.log("Existing products count:", existingProducts == null ? void 0 : existingProducts.length);
        if (!dbError && existingProducts) {
          importedAsins = new Set(existingProducts.map((p) => p.asin));
        } else if (dbError) {
          console.error("Failed to check for existing products:", dbError);
        }
      } else {
        console.error("Failed to find marketplace:", marketplace, marketplaceError);
      }
      console.log("Imported ASINs:", Array.from(importedAsins));
    }
    const resultsWithImportStatus = results.map((product) => ({
      ...product,
      isImported: importedAsins.has(product.asin)
    }));
    console.log("Results with import status:", resultsWithImportStatus.map((p) => ({ asin: p.asin, isImported: p.isImported })));
    return {
      ...data,
      results: resultsWithImportStatus
    };
  } catch (error) {
    console.error("Search API error:", error);
    throw createError({
      statusCode: 500,
      message: "Internal server error"
    });
  }
});

export { search_post as default };
//# sourceMappingURL=search.post.mjs.map
