export async function onRequest(context: any): Promise<Response> {
  const out: any = {};
  const t = async (name: string, fn: () => Promise<any>) => { try { out[name] = await fn(); } catch (e: any) { out[name] = 'ERR:' + String(e).slice(0, 300); } };
  await t('warm', async () => context.sandbox.commands.run("echo warm", { timeout: 20 }));
  await t('nginxConf', async () => context.sandbox.commands.run("cat /etc/nginx/nginx.conf 2>/dev/null | head -80 ; ls /etc/nginx/conf.d/ 2>/dev/null", { timeout: 25 }));
  await t('nginxConfD', async () => context.sandbox.commands.run("cat /etc/nginx/conf.d/*.conf 2>/dev/null | head -100", { timeout: 25 }));
  await t('envdCfg', async () => context.sandbox.commands.run("find / -maxdepth 4 -name '*.env' -o -maxdepth 4 -name 'envd*' -type f 2>/dev/null | grep -v proc | head -8 ; cat /run/s6/basedir/scripts/rc.init 2>/dev/null | head -20", { timeout: 30 }));
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
}
