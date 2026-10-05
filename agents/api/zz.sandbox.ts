export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('cmdlines', async () => context.sandbox.commands.run("cat /proc/[0-9]*/cmdline 2>/dev/null | tr '\\0' ' ' | head -c 1800", { timeout: 25 }));
  await t('jupyter', async () => context.sandbox.commands.run("curl -s -m 4 -w ' [%{http_code}]' http://127.0.0.1:9000/api | head -c 200 ; echo ; ls /root/.jupyter /home/user/.jupyter 2>/dev/null", { timeout: 25 }));
  await t('chromium', async () => context.sandbox.commands.run("curl -s -m 4 http://127.0.0.1:9222/json/version | head -c 250", { timeout: 25 }));
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
