import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { a as createServerSupabaseClient } from '../../../_/supabase.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';

const login_post = defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "Email and password are required"
    });
  }
  const supabase = await createServerSupabaseClient(event);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    throw createError({
      statusCode: 401,
      message: error.message
    });
  }
  return {
    user: data.user,
    session: data.session
  };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
