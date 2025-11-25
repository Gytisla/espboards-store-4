import { d as defineEventHandler, a as getRouterParam, c as createError, r as readBody } from '../../../../../nitro/nitro.mjs';
import { c as createServerSupabaseAdminClient } from '../../../../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const status_patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Product ID is required"
    });
  }
  const body = await readBody(event);
  const { status } = body;
  if (!status || !["draft", "active", "unavailable"].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid status. Must be "draft", "active", or "unavailable"'
    });
  }
  try {
    const adminClient = createServerSupabaseAdminClient();
    const { data: product, error } = await adminClient.from("products").update({
      status,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id).select().single();
    if (error) {
      console.error("Failed to update product status:", error);
      if (error.code === "PGRST116") {
        throw createError({
          statusCode: 404,
          message: "Product not found"
        });
      }
      throw createError({
        statusCode: 500,
        message: "Failed to update product status"
      });
    }
    return {
      success: true,
      product
    };
  } catch (error) {
    console.error("Update status API error:", error);
    throw error;
  }
});

export { status_patch as default };
//# sourceMappingURL=status.patch.mjs.map
