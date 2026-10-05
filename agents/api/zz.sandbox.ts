export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 400); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('openapi', async () => context.sandbox.commands.run("curl -s -m 5 http://127.0.0.1:49999/openapi.json", { timeout: 25 }));
  await t('eoCtx', async () => { const eo = context.eo; if (!eo) return 'no-eo'; return { keys: Object.keys(eo), proto: Object.getOwnPropertyNames(Object.getPrototypeOf(eo) || {}) }; });
  await t('eoDeep', async () => { const eo = context.eo; const snap: any = {}; for (const k of Object.keys(eo || {})) { const v = (eo as any)[k]; snap[k] = typeof v === 'function' ? 'fn:' + (v.name || 'anon') : (v && typeof v === 'object' ? { keys: Object.keys(v).slice(0, 15) } : String(v).slice(0, 80)); } return snap; });
  await t('procCmd', async () => { const f = await import('node:fs'); return f.readFileSync('/proc/self/cmdline', 'utf8').replace(/\0/g, ' ').slice(0, 200); });
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
