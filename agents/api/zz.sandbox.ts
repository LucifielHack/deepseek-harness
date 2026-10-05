export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('envdLog', async () => context.sandbox.commands.run("tail -c 2500 /tmp/envd.log 2>/dev/null || echo no-log", { timeout: 25 }));
  await t('sitesEnabled', async () => context.sandbox.commands.run("ls -la /etc/nginx/sites-enabled/ 2>/dev/null ; cat /etc/nginx/sites-enabled/* 2>/dev/null | head -60", { timeout: 25 }));
  await t('envdProcArgs', async () => context.sandbox.commands.run("cat /proc/$(pgrep -f 'bin/envd' | head -1)/cmdline 2>/dev/null | tr '\\0' ' ' ; echo ; cat /proc/$(pgrep -f 'bin/envd' | head -1)/environ 2>/dev/null | tr '\\0' '\\n' | grep -viE 'path=|hostname|pwd' | head -15", { timeout: 25 }));
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
