export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('procs', async () => context.sandbox.commands.run("ps aux 2>/dev/null | head -25 || ls /proc | grep -E '^[0-9]+$' | head -25", { timeout: 25 }));
  await t('listen', async () => context.sandbox.commands.run("(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null || cat /proc/net/tcp) | head -20", { timeout: 25 }));
  await t('envdFiles', async () => context.sandbox.commands.run("ls -la / ; find / -maxdepth 3 -name '*envd*' -o -maxdepth 3 -name '*sandbox*' 2>/dev/null | grep -v proc | head -15", { timeout: 30 }));
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
