import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const logout_post = defineEventHandler(async () => {
  return {
    success: true
  };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
