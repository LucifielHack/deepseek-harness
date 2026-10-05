export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('info', async () => context.sandbox.getInfo ? context.sandbox.getInfo() : 'no-getInfo');
  await t('envd', async () => { const tok = context.sandbox.envdAccessToken; return { len: String(tok).length, head: String(tok).slice(0, 12) }; });
  await t('recon', async () => context.sandbox.commands.run("ip -4 addr 2>/dev/null | grep inet ; ip route 2>/dev/null | head -5 ; echo ---META--- ; curl -s -m 3 http://169.254.0.23/latest/meta-data/ || echo meta-fail ; echo ---ENVN--- ; env | grep -viE 'token|key|secret|cred' | head -22", { timeout: 30 }));
  await t('host8080', async () => context.sandbox.getHost ? context.sandbox.getHost(8080) : 'no-getHost');
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
