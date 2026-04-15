import { Hono } from 'hono';
import { serve } from 'bun';

const app = new Hono();

app.post('/import', async (c) => {
  const body = await c.req.parseBody();
  console.log(Object.keys(body));
  const val = body['ltos.csv'];
  console.log("val exists?", !!val);
  console.log("val instanceof File?", val instanceof File);
  console.log("val.name:", val?.name);
  return c.json({ ok: true });
});

export default { port: 8788, fetch: app.fetch };
