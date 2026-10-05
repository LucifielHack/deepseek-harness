export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('info', async () => context.sandbox.getInfo ? context.sandbox.getInfo() : 'no-getInfo');
  await t('host8080', async () => context.sandbox.getHost ? context.sandbox.getHost(8080) : 'no-getHost');
  await t('host9000', async () => context.sandbox.getHost ? context.sandbox.getHost(9000) : 'no-getHost');
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
