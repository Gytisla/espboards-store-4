import { d as defineEventHandler, b as getHeader, c as createError } from '../../../nitro/nitro.mjs';
import { a as createServerSupabaseClient } from '../../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const user_get = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: "No authorization header"
    });
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "No token provided"
    });
  }
  const supabase = await createServerSupabaseClient(event);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw createError({
      statusCode: 401,
      message: "Invalid token"
    });
  }
  return { user };
});

export { user_get as default };
//# sourceMappingURL=user.get.mjs.map
