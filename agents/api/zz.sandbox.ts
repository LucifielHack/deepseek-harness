export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  const paths = ["/envd","/envd/ping","/health","/ping","/docs","/openapi.json"];
  for (const p of paths) {
    await t('p' + p.replace(/\//g,'_'), async () => context.sandbox.commands.run("curl -s -m 4 -w ' [%{http_code}]' http://127.0.0.1:49999" + p + " | head -c 200", { timeout: 20 }));
  }
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
